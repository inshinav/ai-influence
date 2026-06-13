// Путь к пользовательским видео в public/examples с учётом base-пути сборки.
export function publicExamplePath(fileName: string) {
  return `${import.meta.env.BASE_URL}examples/${fileName}`
}
