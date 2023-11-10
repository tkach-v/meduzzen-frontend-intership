import apiClient from "@/http/axios/apiClient";

export function sortByTimestamp(data) {
  return data.sort((a, b) => {
    const timestampA = new Date(a.timestamp).getTime()
    const timestampB = new Date(b.timestamp).getTime()

    return timestampA - timestampB
  });
}

export async function handleExportData(format, exportUrl, fileName) {
  try {
    const {data} = await apiClient.get(`${exportUrl}`)

    const blobData = format === 'csv' ? data : JSON.stringify(data)
    const blobType = format === 'csv' ? `text/csv` : `application/json`
    const blob = new Blob([blobData], {type: blobType})

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileName}.${format}`
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('API Error:', error)
  }
}