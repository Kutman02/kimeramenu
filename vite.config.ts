import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import fs from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'

const MENU_DATA_ENDPOINT = '/__admin/menu-data'
const MAX_BODY_SIZE_BYTES = 5 * 1024 * 1024

type MenuDataPayload = {
  supportedLanguages?: unknown
  restaurants?: unknown
}

const sendJson = (
  response: ServerResponse,
  statusCode: number,
  payload: Record<string, unknown>
) => {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

const readRequestBody = (request: IncomingMessage) =>
  new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = []
    let totalSize = 0

    request.on('data', (chunk: Buffer | string) => {
      const bufferChunk = typeof chunk === 'string' ? Buffer.from(chunk) : chunk
      totalSize += bufferChunk.length

      if (totalSize > MAX_BODY_SIZE_BYTES) {
        reject(new Error('Request body is too large.'))
        request.destroy()
        return
      }

      chunks.push(bufferChunk)
    })

    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    request.on('error', reject)
  })

const writeJsonFile = async (filePath: string, value: unknown) => {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const createAdminFileSyncPlugin = (): Plugin => {
  let projectRoot = process.cwd()

  return {
    name: 'admin-file-sync',
    apply: 'serve',
    configResolved(config) {
      projectRoot = config.root
    },
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const requestUrl = request.url ? new URL(request.url, 'http://localhost') : null

        if (!requestUrl || requestUrl.pathname !== MENU_DATA_ENDPOINT) {
          next()
          return
        }

        if (request.method !== 'POST') {
          sendJson(response, 405, {
            ok: false,
            message: 'Method not allowed. Use POST.',
          })
          return
        }

        try {
          const bodyText = await readRequestBody(request)
          const payload = JSON.parse(bodyText) as MenuDataPayload

          if (!isRecord(payload)) {
            sendJson(response, 400, {
              ok: false,
              message: 'Invalid JSON payload.',
            })
            return
          }

          if (!Array.isArray(payload.supportedLanguages)) {
            sendJson(response, 400, {
              ok: false,
              message: 'supportedLanguages must be an array.',
            })
            return
          }

          if (!Array.isArray(payload.restaurants) || payload.restaurants.length === 0) {
            sendJson(response, 400, {
              ok: false,
              message: 'restaurants must be a non-empty array.',
            })
            return
          }

          const primaryRestaurant = payload.restaurants[0]
          if (!isRecord(primaryRestaurant)) {
            sendJson(response, 400, {
              ok: false,
              message: 'Restaurant payload must be an object.',
            })
            return
          }

          const allergens = Array.isArray(primaryRestaurant.allergens)
            ? primaryRestaurant.allergens
            : []
          const categories = Array.isArray(primaryRestaurant.categories)
            ? primaryRestaurant.categories
            : []
          const restaurantInfo = { ...primaryRestaurant }
          delete restaurantInfo.allergens
          delete restaurantInfo.categories

          const supportedLanguagesPath = path.resolve(projectRoot, 'src/data/supportedLanguages.json')
          const restaurantInfoPath = path.resolve(
            projectRoot,
            'src/data/restaurants/breakfast/info.json'
          )
          const allergensPath = path.resolve(
            projectRoot,
            'src/data/restaurants/breakfast/allergens.json'
          )
          const categoriesPath = path.resolve(
            projectRoot,
            'src/data/restaurants/breakfast/categories.json'
          )
          const menuSnapshotPath = path.resolve(projectRoot, 'src/data/menu.json')

          await Promise.all([
            writeJsonFile(supportedLanguagesPath, payload.supportedLanguages),
            writeJsonFile(restaurantInfoPath, restaurantInfo),
            writeJsonFile(allergensPath, allergens),
            writeJsonFile(categoriesPath, categories),
            writeJsonFile(menuSnapshotPath, payload),
          ])

          sendJson(response, 200, {
            ok: true,
            message: 'Данные успешно сохранены в JSON-файлы проекта.',
          })
        } catch (error) {
          if (error instanceof SyntaxError) {
            sendJson(response, 400, {
              ok: false,
              message: 'JSON parse error in request body.',
            })
            return
          }

          sendJson(response, 500, {
            ok: false,
            message: error instanceof Error ? error.message : 'Failed to save menu data.',
          })
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), createAdminFileSyncPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
