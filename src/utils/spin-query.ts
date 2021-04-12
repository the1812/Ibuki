import { allMutations } from './observer'

/** 轮询设置 */
export interface SpinQueryConfig {
  /** 最大重试次数 */
  maxRetry?: number
  /** 重试间隔(ms) */
  queryInterval?: number
  /** 是否无视文档聚焦状态, 在文档未聚焦时, 使查询失败仍计入重试次数中. */
  ignoreFocus?: boolean
}
const defaultConfig: Required<SpinQueryConfig> = {
  maxRetry: 15,
  queryInterval: 1000,
  ignoreFocus: false,
}
/**
 * 基本轮询器, 反复按照一定时间间隔(`config.queryInterval`)进行查询:
 * - 当达成条件时(`condition`返回`true`), 结束并返回目标对象
 * - 超过最大重试次数(`config.maxRetry`)时, 返回`null`
 * - 手动中断时(`condition`中调用`stop()`), 返回最近的一次查询得到的目标对象
 * @param query 查询目标
 * @param condition 判断目标是否符合完成查询的条件, 省略则直接将目标转为`Boolean`
 * @param config 轮询设置
 */
export const sq = <T>(
  query: () => T,
  condition: (
    /** 本轮查询的目标对象 */
    target: T,
    /** 调用此函数可立即中断轮询, 并返回此次的`target` */
    stop: () => void
  ) => boolean = it => Boolean(it),
  config: SpinQueryConfig = defaultConfig,
) => {
  const combinedConfig: Required<SpinQueryConfig> = {
    ...defaultConfig,
    ...config,
  }
  return new Promise<T | null>(resolve => {
    let target: T | null = null
    let queryTimes = 0
    const stop = () => {
      resolve(target)
    }
    const tryQuery = () => {
      if (queryTimes > combinedConfig.maxRetry) {
        resolve(null)
        return
      }
      target = query()
      if (condition(target, stop) === true) {
        resolve(target)
      } else {
        if (combinedConfig.ignoreFocus || !(typeof document !== 'undefined' && !document.hasFocus())) {
          queryTimes++
        }
        setTimeout(() => tryQuery(), combinedConfig.queryInterval)
      }
    }
    tryQuery()
  })
}

const selectCache = new Map<string, Promise<unknown>>()
const selectPromise = <T = Element>(
  query: string | (() => T | null),
  getPromise: (realQuery: () => T | null) => Promise<T>,
) => {
  let realQuery: () => T | null
  if (typeof query === 'string') {
    if (selectCache.has(query)) {
      return selectCache.get(query) as Promise<T>
    }
    realQuery = () => document.querySelector(query) as any
  } else {
    realQuery = query
  }
  const sqPromise = getPromise(realQuery)
  if (typeof query === 'string') {
    const promise = sqPromise.then(result => {
      selectCache.delete(query)
      return result
    })
    selectCache.set(query, promise)
    return promise
  }
  return sqPromise
}
/**
 * 轮询选择DOM元素, 也可选择其他任意对象, 得到非`null`且非`undefined`时结束
 * @param query 选择器字符串(用于`document.querySelector`中), 或其他任意有返回的函数
 * @param config 轮询设置
 */
export const select = <T = Element>(
  query: string | (() => T | null),
  config?: SpinQueryConfig,
) => selectPromise(query, realQuery => sq(realQuery, v => v !== null && v !== undefined, config))

/**
 * 通过Observer等待惰性加载的DOM元素, 也可选择其他任意对象, 得到非`null`且非`undefined`时结束
 *
 * 结束之前每当DOM发生变化就会再次进行查询
 * @param query 选择器字符串(用于`document.querySelector`中), 或其他任意有返回的函数
 */
export const selectLazy = <T = Element>(
  query: string | (() => T | null),
) => selectPromise(query, realQuery => new Promise<T>(resolve => {
  allMutations(() => {
    const result = realQuery()
    if (result !== null && result !== undefined) {
      resolve(result)
    }
  })
}))

const selectAllCache = new Map<string, Promise<unknown>>()
const selectAllPromise = <T extends { length: number } = Element[]>(
  query: string | (() => T),
  getPromise: (realQuery: () => T) => Promise<T>,
) => {
  let realQuery: () => T
  if (typeof query === 'string') {
    if (selectAllCache.has(query)) {
      return selectAllCache.get(query) as Promise<T>
    }
    realQuery = () => Array.from(document.querySelectorAll(query)) as any
  } else {
    realQuery = query
  }
  const handleResult = (result: T) => {
    if (result === null) {
      return [] as any
    }
    return result
  }
  const sqPromise = getPromise(realQuery)
  if (typeof query === 'string') {
    const promise = sqPromise.then(result => {
      selectAllCache.delete(query)
      return handleResult(result)
    })
    selectAllCache.set(query, promise)
    return promise
  }
  return sqPromise.then(result => handleResult(result))
}
/**
 * 轮询选择所有匹配的DOM元素, 也可选择其他任意的`{ length: number }`, 在得到大于等于1个元素后结束, 轮询失败返回空数组
 * @param query 选择器字符串(用于`document.querySelectorAll`中), 或任意返回数组类型的函数
 * @param config 轮询设置
 */
export const selectAll = <T extends { length: number } = Element[]>(
  query: string | (() => T),
  config?: SpinQueryConfig,
) => selectAllPromise(query, realQuery => sq(realQuery, elements => elements.length > 0, config))
/**
 * 通过Observer等待惰性加载的DOM元素, 选择所有匹配的DOM元素, 也可选择其他任意的`{ length: number }`, 在得到大于等于1个元素后结束
 *
 * 结束之前每当DOM发生变化就会再次进行查询
 * @param query 选择器字符串(用于`document.querySelectorAll`中), 或任意返回数组类型的函数
 */
export const selectAllLazy = <T extends { length: number } = Element[]>(
  query: string | (() => T),
) => selectAllPromise(query, realQuery => new Promise<T>(resolve => {
  allMutations(() => {
    const result = realQuery()
    if (result !== null && result !== undefined) {
      resolve(result)
    }
  })
}))

/**
 * 轮询数组并在达到指定元素量后结束, 带有`length`属性的对象也可视为数组
 * @param query 任意返回数组的函数
 * @param targetCount 目标元素数量
 * @param config 轮询设置
 */
export const count = <T extends { length: number }>(
  query: () => T,
  targetCount: number,
  config?: SpinQueryConfig,
) => sq(query, array => array.length === targetCount, config)
