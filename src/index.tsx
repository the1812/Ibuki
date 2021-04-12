const togglePanel = async () => {
  const React = await import('react')
  const ReactDOM = await import('react-dom')
  const { Main } = await import('./main')

  let root = document.querySelector('.ibuki')
  if (root) {
    root.classList.toggle('hide')
  } else {
    root = document.createElement('div')
    root.classList.add('ibuki')
    ReactDOM.render(<Main />, root)
    document.body.appendChild(root)
  }
}
GM_registerMenuCommand('Toggle panel', togglePanel)
document.addEventListener('keydown', e => {
  const ctrl = e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey
  if (ctrl && e.key === 'i') {
    togglePanel()
    e.preventDefault()
    e.stopImmediatePropagation()
  }
})
