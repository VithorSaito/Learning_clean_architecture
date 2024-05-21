import { mockPurchases } from '@/data/test'
import { CacheStoreSpy, getCacheExpirationDate } from '../../test/mock-cache'
import { LocalLoadPurchases } from './local-load-purchases'

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
    test("Should return empty list if load fails", () => {
        const { cacheStore, sut } = makeSut()
        cacheStore.simulateFetchError()
        sut.validate()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete])
        expect(cacheStore.deleteKey).toBe("purchases")

    })
    test("Should has no side effect if load succeeds", () => {
        const currentDate = new Date()
        const timeStamp = getCacheExpirationDate(currentDate)
        timeStamp.setSeconds(timeStamp.getSeconds() + 1)
        const { cacheStore, sut } = makeSut(currentDate)
        cacheStore.fetchResult = { timeStamp }
        sut.validate()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
        expect(cacheStore.fetchKey).toBe('purchases')
    })
    test("Should delete cache if its expired", () => {
        const currentDate = new Date()
        const timeStamp = getCacheExpirationDate(currentDate)
        timeStamp.setSeconds(timeStamp.getSeconds() - 1)
        const { cacheStore, sut } = makeSut(currentDate)
        cacheStore.fetchResult = { timeStamp }
        sut.validate()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(cacheStore.deleteKey).toBe('purchases')
    })
    test("Should delete cache if its on expiration date", async () => {
        const currentDate = new Date()
        const timeStamp = getCacheExpirationDate(currentDate)
        const { cacheStore, sut } = makeSut(currentDate)
        cacheStore.fetchResult = { timeStamp }
        sut.validate()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(cacheStore.deleteKey).toBe('purchases')
    })
})