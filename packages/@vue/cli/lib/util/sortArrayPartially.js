module.exports = function sortArrayPartially (array, idOrder) {
  if (!array) return []
  const res = array
  const swappableIndexes = []
  const subArrayItems = []

  if (idOrder) {
    idOrder.forEach(key => {
      const index = array.findIndex((i) => i.id === key)
      if (index !== -1) {
        swappableIndexes.push(index)
        subArrayItems.push(array[index])
      }
    })
  }
  swappableIndexes.sort().forEach((index, subIndex) => {
    res[index] = subArrayItems[subIndex]
  })

  return res
}
