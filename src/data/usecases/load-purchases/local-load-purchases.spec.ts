import { CacheStoreSpy } from '../../test/mock-cache'
import { LocalLoadPurchases } from './local-load-purchases'
import { mockPurchases } from '../../test/mock-purchases'
import { getCacheExpirationDate } from '../../test/mock-cache'


type SutTypes = {
    sut: LocalLoadPurchases
    cacheStore: CacheStoreSpy
}

const makeSut = (timeStamp = new Date()): SutTypes => {
    const cacheStore = new CacheStoreSpy()
    const sut = new LocalLoadPurchases(cacheStore, timeStamp)
    return {
        sut,
        cacheStore
    }
}

describe(("LocalSavePurchases"), () => {
    test("Should not delete or insert chache on sut.init", () => {
        const { cacheStore } = makeSut()
        expect(cacheStore.actions).toEqual([])
    })
    test("Should return empty list if load fails", async () => {
        const { cacheStore, sut } = makeSut()
        cacheStore.simulateFetchError()
        const purchases = await sut.loadAll()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
        expect(purchases).toEqual([])
    })
    test("Should return a list of purchases if cache is valid", async () => {
        const currentDate = new Date()
        const timeStamp = getCacheExpirationDate(currentDate)
        timeStamp.setSeconds(timeStamp.getSeconds() + 1)
        const { cacheStore, sut } = makeSut(currentDate)
        cacheStore.fetchResult = {
            timeStamp,
            value: mockPurchases()
        }
        const purchases = await sut.loadAll()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(purchases).toEqual(cacheStore.fetchResult.value)
    })
    test("Should return an empty list if cache is expired", async () => {
        const currentDate = new Date()
        const timeStamp = getCacheExpirationDate(currentDate)
        timeStamp.setSeconds(timeStamp.getSeconds() - 1)
        const { cacheStore, sut } = makeSut(currentDate)
        cacheStore.fetchResult = {
            timeStamp,
            value: mockPurchases()
        }
        const purchases = await sut.loadAll()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(purchases).toEqual([])
    })
    test("Should return an empty list if cache is on expiration date", async () => {
        const currentDate = new Date()
        const timeStamp = getCacheExpirationDate(currentDate)
        const { cacheStore, sut } = makeSut(currentDate)
        cacheStore.fetchResult = {
            timeStamp,
            value: mockPurchases()
        }
        const purchases = await sut.loadAll()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(purchases).toEqual([])
    })
    test("Should return an empty list if cache is empty", async () => {
        const currentDate = new Date()
        const timeStamp = getCacheExpirationDate(currentDate)
        timeStamp.setSeconds(timeStamp.getSeconds() + 1)
        const { cacheStore, sut } = makeSut(currentDate)
        cacheStore.fetchResult = {
            timeStamp,
            value: []
        }
        const purchases = await sut.loadAll()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(purchases).toEqual([])
    })
})