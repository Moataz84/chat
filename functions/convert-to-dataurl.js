const getDataUrl = file => new Promise(resolve => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => resolve(reader.result)
})

export default getDataUrl