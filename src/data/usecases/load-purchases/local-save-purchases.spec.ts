import { CacheStoreSpy } from '../../test/mock-cache'
import { LocalLoadPurchases } from './local-load-purchases'
import { mockPurchases } from '../../test/mock-purchases'

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
    test("Should not insert new Cache if delete fails", async () => {
        const { cacheStore, sut } = makeSut()
        cacheStore.simulateDeleteError()
        const promise = sut.save(mockPurchases())
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.delete])
        await expect(promise).rejects.toThrow()
    })
    test("Should insert new Cache if delete succeeds", async () => {
        const timeStamp = new Date()
        const { cacheStore, sut } = makeSut()
        const purchases = mockPurchases()
        const promise = sut.save(purchases)
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.delete, CacheStoreSpy.Action.insert])
        expect(cacheStore.insertKey).toBe('purchases')
        expect(cacheStore.deleteKey).toBe('purchases')
        expect(cacheStore.insertValues).toEqual({
            timeStamp,
            value: purchases
        })
        await expect(promise).resolves.toBeFalsy()
    })
    test("Should throw if insert throws", async () => {
        const { cacheStore, sut } = makeSut()
        cacheStore.simulateInsartError()
        const promise = sut.save(mockPurchases())
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.delete, CacheStoreSpy.Action.insert])
        await expect(promise).rejects.toThrow()
    })
})