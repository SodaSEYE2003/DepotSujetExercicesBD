import { getRequestConfig } from "next-intl/server"

export default getRequestConfig(async ({ locale }) => {
  // Load messages from JSON files
  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  }
})
