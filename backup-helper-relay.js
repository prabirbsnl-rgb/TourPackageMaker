import { spawn } from 'node:child_process'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyBackupAdmin } from './backup-tools/verify-backup-admin.mjs'

const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://192.168.0.102:5173',
])

const CONTROLLER_URL = 'http://127.0.0.1:4318'

const SERVICE_MANAGER_URL = 'http://127.0.0.1:4320'


const CONTROLLER_SECRET =
  process.env.ORBITZ_BACKUP_CONTROLLER_SECRET ||
  ''



const PROJECT_ROOT = path.dirname(fileURLToPath(import.meta.url))
const SERVICE_MANAGER_SCRIPT = path.join(
  PROJECT_ROOT,
  'backup-tools',
  'orbitz-backup-service-manager.mjs'
)

let serviceManagerChild = null
let serviceManagerStartPromise = null

async function readServiceManagerStatus(firebaseToken) {
  try {
    const response = await fetch(`${SERVICE_MANAGER_URL}/status`, {
      method: 'GET',
      headers: { 'X-Firebase-ID-Token': firebaseToken },
      cache: 'no-store',
      signal: AbortSignal.timeout(1500),
    })
    const data = await response.json().catch(() => ({}))

    return {
      reachable:
        response.ok &&
        data.ok === true &&
        data.service === 'Orbitz Backup Service Manager' &&
        data.version === 1,
      data,
    }
  } catch {
    return { reachable: false, data: null }
  }
}

function isServiceManagerPortOccupied() {
  return new Promise((resolve) => {
    const socket = net.createConnection({
      host: '127.0.0.1',
      port: 4320,
    })
    let settled = false

    const finish = (occupied) => {
      if (settled) return
      settled = true
      socket.destroy()
      resolve(occupied)
    }

    socket.setTimeout(1500)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(true))
    socket.once('error', (error) => {
      finish(error.code !== 'ECONNREFUSED')
    })
  })
}

async function startServiceManager(firebaseToken) {
  if (serviceManagerStartPromise) {
    return serviceManagerStartPromise
  }

  serviceManagerStartPromise = (async () => {
    const existing = await readServiceManagerStatus(firebaseToken)

    if (existing.reachable) {
      return {
        status: 200,
        data: {
          ok: true,
          message: 'Service Manager is already running.',
          serviceManager: existing.data,
        },
      }
    }

    if (await isServiceManagerPortOccupied()) {
      return {
        status: 503,
        data: {
          ok: false,
          error:
            'Service Manager port is occupied, but authenticated status could not be confirmed. No new process was started.',
        },
      }
    }

    let child
    let startFailed = false

    try {
      child = spawn(
        process.execPath,
        [SERVICE_MANAGER_SCRIPT],
        {
          cwd: PROJECT_ROOT,
          env: { ...process.env },
          windowsHide: true,
          stdio: ['ignore', 'inherit', 'inherit'],
        }
      )
      serviceManagerChild = child

      child.once('error', () => {
        startFailed = true
        if (serviceManagerChild === child) serviceManagerChild = null
        console.error('Service Manager process could not be started.')
      })

      child.once('exit', () => {
        if (serviceManagerChild === child) serviceManagerChild = null
      })
    } catch {
      return {
        status: 503,
        data: {
          ok: false,
          error: 'Service Manager could not be started.',
        },
      }
    }

    const deadline = Date.now() + 8000

    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 250))

      const check = await readServiceManagerStatus(firebaseToken)
      if (check.reachable) {
        return {
          status: 200,
          data: {
            ok: true,
            message: 'Service Manager started and authenticated.',
            serviceManager: check.data,
          },
        }
      }

      if (startFailed || child.exitCode !== null || child.signalCode !== null) {
        break
      }
    }

    const finalCheck = await readServiceManagerStatus(firebaseToken)
    if (finalCheck.reachable) {
      return {
        status: 200,
        data: {
          ok: true,
          message: 'Service Manager started and authenticated.',
          serviceManager: finalCheck.data,
        },
      }
    }

    if (await isServiceManagerPortOccupied()) {
      return {
        status: 503,
        data: {
          ok: false,
          error:
            'Service Manager startup could not be authenticated or confirmed. Its port may still be occupied; refresh status before retrying.',
        },
      }
    }

    return {
      status: 503,
      data: {
        ok: false,
        error:
          'Service Manager startup failed. Check the Vite console and port status before retrying.',
      },
    }
  })()

  try {
    return await serviceManagerStartPromise
  } finally {
    serviceManagerStartPromise = null
  }
}



export function registerBackupHelperRelay(middlewares) {
  if (!CONTROLLER_SECRET || CONTROLLER_SECRET.length < 32) {
    throw new Error(
      'Orbitz Backup Relay: controller secret is missing or invalid.'
    )
  }
middlewares.use(async (req, res, next) => {

    const pathname = (req.url || '').split('?')[0]

        const isHelperRoute =
      pathname.startsWith('/api/backup-helper/')

    const isServiceManagerRoute =
      pathname.startsWith('/api/backup-service-manager/')

    if (!isHelperRoute && !isServiceManagerRoute) {
      return next()
    }

    
    const origin = req.headers.origin
    const host = req.headers.host
    const referer = req.headers.referer

    const allowedHost = typeof host === 'string' &&
      [...ALLOWED_ORIGINS].some((allowedOrigin) => {
        return new URL(allowedOrigin).host === host
      })

    const validReferer = typeof referer === 'string' &&
      [...ALLOWED_ORIGINS].some((allowedOrigin) => {
        return referer.startsWith(`${allowedOrigin}/`) ||
          referer === allowedOrigin
      })

    const originAllowed = origin
      ? ALLOWED_ORIGINS.has(origin)
      : req.method === 'GET' && allowedHost && validReferer

    if (!originAllowed) {
      res.writeHead(403, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Origin',
      })
      return res.end(JSON.stringify({
        ok: false,
        error: 'Origin not allowed.',
      }))
    }


        if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Firebase-ID-Token, Content-Type',
        'Access-Control-Max-Age': '600',
        'Cache-Control': 'no-store',
        'Vary': 'Origin',
        'X-Content-Type-Options': 'nosniff',
      })
      return res.end()
    }

    const routes = new Map([

      
      ['/api/backup-service-manager/status', {
        managerPath: '/status',
        upstream: 'manager',
        method: 'GET',
      }],
      ['/api/backup-service-manager/start', {
        upstream: 'supervisor',
        action: 'start-manager',
        method: 'POST',
        allowEmptyBody: true,
      }],
      ['/api/backup-service-manager/shutdown', {
        managerPath: '/manager/shutdown',
        upstream: 'manager',
        method: 'POST',
        allowEmptyBody: true,
      }],
      ['/api/backup-service-manager/controller/start', {
        managerPath: '/controller/start',
        upstream: 'manager',
        method: 'POST',
        allowEmptyBody: true,
      }],
      ['/api/backup-service-manager/controller/stop', {
        managerPath: '/controller/stop',
        upstream: 'manager',
        method: 'POST',
        allowEmptyBody: true,
      }],



      ['/api/backup-helper/status', {
        controllerPath: '/status',
        method: 'GET',
      }],

            ['/api/backup-helper/start', {
        controllerPath: '/start',
        method: 'POST',
        allowEmptyBody: true,
      }],
      ['/api/backup-helper/stop', {
        controllerPath: '/stop',
        method: 'POST',
        allowEmptyBody: true,
      }],


            ['/api/backup-helper/local-backups', {
        controllerPath: '/local-backups',
        method: 'POST',
      }],
            ['/api/backup-helper/local-backups/pre-restore', {
        controllerPath: '/local-backups/pre-restore',
        method: 'POST',
      }],
            ['/api/backup-helper/verify-backup', {
        controllerPath: '/verify-backup',
        method: 'POST',
        timeoutMs: 155000,
      }],
      ['/api/backup-helper/firestore-backup', {
        controllerPath: '/firestore-backup',
        method: 'POST',
        timeoutMs: 335000,
        allowEmptyBody: true,
      }],
    ])

    const route = routes.get(pathname)

    if (!route) {
      res.writeHead(503, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({
        ok: false,
        error: 'This backup endpoint is not enabled yet.',
      }))
    }

    if (req.method !== route.method) {
      res.writeHead(405, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({
        ok: false,
        error: 'Method not allowed.',
      }))
    }


        const firebaseToken = req.headers['x-firebase-id-token']

    if (
      typeof firebaseToken !== 'string' ||
      !firebaseToken.trim() ||
      firebaseToken.length > 8192
    ) {
      res.writeHead(401, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      })
      return res.end(JSON.stringify({
        ok: false,
        error: 'A valid Firebase ID token is required.',
      }))
    }

        try {
      let requestBody

      if (route.method === 'POST') {
        const chunks = []
        let totalBytes = 0
        const maxRequestBytes = 10 * 1024 * 1024

        const declaredLength = Number(req.headers['content-length'] || 0)

        if (
          !Number.isFinite(declaredLength) ||
          declaredLength < 0 ||
          declaredLength > maxRequestBytes
        ) {
          res.writeHead(413, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff',
          })
          return res.end(JSON.stringify({
            ok: false,
            error: 'Request body exceeds the permitted size or has an invalid length.',
          }))
        }

        for await (const chunk of req) {
          totalBytes += chunk.length

          if (totalBytes > maxRequestBytes) {
            res.writeHead(413, {
              'Content-Type': 'application/json; charset=utf-8',
              'Cache-Control': 'no-store',
              'X-Content-Type-Options': 'nosniff',
            })
            return res.end(JSON.stringify({
              ok: false,
              error: 'Request body exceeds the permitted size.',
            }))
          }

          chunks.push(chunk)
        }

                if (totalBytes === 0 && !route.allowEmptyBody) {
          res.writeHead(400, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff',
          })
          return res.end(JSON.stringify({
            ok: false,
            error: 'Request body is required.',
          }))
        }

        requestBody = Buffer.concat(chunks)
      }

      if (route.upstream === 'supervisor' && route.action === 'start-manager') {
        let adminResult

        try {
          adminResult = await verifyBackupAdmin({
            headers: { 'x-firebase-id-token': firebaseToken.trim() },
          })
        } catch {
          res.writeHead(503, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff',
          })
          return res.end(JSON.stringify({
            ok: false,
            error: 'Admin authorization could not be verified. Try again later.',
          }))
        }

        if (!adminResult?.ok) {
          res.writeHead(adminResult?.status || 403, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff',
          })
          return res.end(JSON.stringify({
            ok: false,
            error: adminResult?.error || 'Administrator access is required.',
          }))
        }

        const result = await startServiceManager(firebaseToken.trim())
        res.writeHead(result.status, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        })
        return res.end(JSON.stringify(result.data))
      }

           const upstreamBase =
        route.upstream === 'manager'
          ? SERVICE_MANAGER_URL
          : CONTROLLER_URL

      const upstreamPath =
        route.upstream === 'manager'
          ? route.managerPath
          : route.controllerPath

      const upstream = await fetch(
        `${upstreamBase}${upstreamPath}`,
        {
          method: route.method,
         
          headers: {
            ...(route.upstream === 'manager'
              ? {}
              : { Authorization: `Bearer ${CONTROLLER_SECRET}` }),
            'X-Firebase-ID-Token': firebaseToken.trim(),
            ...(route.method === 'POST'
              ? { 'Content-Type': 'application/json' }
              : {}),
          },

          ...(route.method === 'POST'
            ? { body: requestBody }
            : {}),
          signal: AbortSignal.timeout(
  route.timeoutMs || (route.method === 'POST' ? 30000 : 3000)
),
        }
      )

      if (!upstream.body) {
        res.writeHead(502, {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        })
        return res.end(JSON.stringify({
          ok: false,
          error: 'Controller returned an empty response.',
        }))
      }

      const reader = upstream.body.getReader()
      const chunks = []
      let totalBytes = 0
      const maxResponseBytes = 64 * 1024

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        totalBytes += value.byteLength

        if (totalBytes > maxResponseBytes) {
          await reader.cancel().catch(() => {})

          res.writeHead(502, {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
            'X-Content-Type-Options': 'nosniff',
          })
          return res.end(JSON.stringify({
            ok: false,
            error: 'Controller response exceeded the permitted size.',
          }))
        }

        chunks.push(value)
      }

      const responseBytes = new Uint8Array(totalBytes)
      let offset = 0

      for (const chunk of chunks) {
        responseBytes.set(chunk, offset)
        offset += chunk.byteLength
      }

      res.writeHead(upstream.status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      })

      return res.end(new TextDecoder().decode(responseBytes))
    } catch {
      if (res.headersSent || res.destroyed) return

      res.writeHead(502, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      })

      return res.end(JSON.stringify({
        ok: false,
        error: 'Backup Controller is unavailable or did not respond in time.',
      }))
    }
  })
}
