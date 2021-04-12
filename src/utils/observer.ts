type ObserverTarget = string | Element[] | Element
const resolveTargets = (target: ObserverTarget) => {
  if (typeof target === 'string') {
    return [...document.querySelectorAll(target)]
  }
  if (Array.isArray(target)) {
    return target
  }
  return [target]
}
const mutationObserve = (
  targets: Element[],
  config: MutationObserverInit,
  callback: MutationCallback,
): [MutationObserver, MutationObserverInit] => {
  const observer = new MutationObserver(callback)
  targets.forEach(it => observer.observe(it, config))
  callback([], observer)
  return [observer, config]
}
/** 监听直接子元素
 * @param target 监听目标
 * @param callback 回调函数
 */
export const childList = (
  target: ObserverTarget,
  callback: MutationCallback,
) => mutationObserve(resolveTargets(target), {
  childList: true,
  subtree: false,
  attributes: false,
}, callback)
/** 监听所有子孙元素
* @param target 监听目标
* @param callback 回调函数
*/
export const childListSubtree = (
  target: ObserverTarget,
  callback: MutationCallback,
) => mutationObserve(resolveTargets(target), {
  childList: true,
  subtree: true,
  attributes: false,
}, callback)
/** 监听自身的HTML属性变化
 * @param target 监听目标
 * @param callback 回调函数
 */
export const attributes = (
  target: ObserverTarget,
  callback: MutationCallback,
) => mutationObserve(resolveTargets(target), {
  childList: false,
  subtree: false,
  attributes: true,
}, callback)
/** 监听自身及其子孙元素的HTML属性变化
 * @param target 监听目标
 * @param callback 回调函数
 */
export const attributesSubtree = (
  target: ObserverTarget,
  callback: MutationCallback,
) => mutationObserve(resolveTargets(target), {
  childList: false,
  subtree: true,
  attributes: true,
}, callback)
/** 监听自身的文本内容变化
 * @param target 监听目标
 * @param callback 回调函数
 */
export const characterData = (
  target: ObserverTarget,
  callback: MutationCallback,
) => mutationObserve(resolveTargets(target), {
  childList: false,
  subtree: false,
  attributes: false,
  characterData: true,
}, callback)
/** 监听自身及其子孙元素的文本内容变化
 * @param target 监听目标
 * @param callback 回调函数
 */
export const characterDataSubtree = (
  target: ObserverTarget,
  callback: MutationCallback,
) => mutationObserve(resolveTargets(target), {
  childList: false,
  subtree: true,
  attributes: false,
  characterData: true,
}, callback)
/** 监听指定目标上的所有变化, 包括自身及子孙元素的元素增减, 属性变化, 文本内容变化
 *
 * 若需要监听 `document.body` 上的, 请使用 allMutations
 * @param target 监听目标
 * @param callback 回调函数
 */
export const allMutationsOn = (
  target: ObserverTarget,
  callback: MutationCallback,
) => mutationObserve(resolveTargets(target), {
  childList: true,
  subtree: true,
  attributes: true,
  characterData: true,
}, callback)

let everyNodesObserver: [MutationObserver, MutationObserverInit]
/**
 * 监听 `document.body` 上的所有变化, 包括自身及子孙元素的元素增减, 属性变化, 文本内容变化
 * @param callback 回调函数
 */
export const allMutations = (callback: MutationCallback) => {
  if (!everyNodesObserver) {
    everyNodesObserver = allMutationsOn(document.body, callback)
  }
  return everyNodesObserver
}

const intersectionObserve = (
  targets: Element[],
  config: IntersectionObserverInit,
  callback: IntersectionObserverCallback,
) => {
  const observer = new IntersectionObserver(callback, config)
  targets.forEach(it => observer.observe(it))
  return [observer, config]
}
/**
 * 监听元素进入视图内/变为可见
 * @param target 监听目标
 * @param callback 回调函数
 */
export const visible = (
  target: ObserverTarget,
  callback: IntersectionObserverCallback,
) => intersectionObserve(resolveTargets(target), {}, callback)
/**
 * 监听元素进入指定容器内/变为可见
 * @param target 监听目标
 * @param container 容器
 * @param margin 检测边距
 * @param callback 回调函数
 */
export const visibleInside = (
  target: ObserverTarget,
  container: HTMLElement,
  margin: string,
  callback: IntersectionObserverCallback,
) => intersectionObserve(resolveTargets(target), {
  root: container,
  rootMargin: margin,
}, callback)

const resizeObserve = (
  targets: Element[],
  config: ResizeObserverOptions,
  callback: ResizeObserverCallback,
) => {
  const observer = new ResizeObserver(callback)
  targets.forEach(it => observer.observe(it, config))
  return [observer, config]
}
/**
 * 监听元素自身的尺寸变化
 * @param target 监听目标
 * @param callback 回调函数
 */
export const sizeChange = (
  target: ObserverTarget,
  callback: ResizeObserverCallback,
) => resizeObserve(resolveTargets(target), {
  box: 'border-box',
}, callback)
