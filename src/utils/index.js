export function sortByTimestamp(data) {
  return data.sort((a, b) => {
    const timestampA = new Date(a.timestamp).getTime()
    const timestampB = new Date(b.timestamp).getTime()

    return timestampA - timestampB
  });
}