// Server-only — do NOT import in client components
import 'server-only'
import fs from 'fs'
import path from 'path'
import type { PJData, PFData, Lancamento } from './types'

export type { PJData, PFData, Lancamento }

const ROOT = process.cwd()

export function readJSON<T>(filePath: string): T | null {
  try {
    const abs = path.join(ROOT, filePath)
    return JSON.parse(fs.readFileSync(abs, 'utf-8')) as T
  } catch {
    return null
  }
}

export function writeJSON(filePath: string, data: unknown): void {
  const abs = path.join(ROOT, filePath)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, JSON.stringify(data, null, 2), 'utf-8')
}

export function readConfig() {
  return readJSON<Record<string, unknown>>('config/sistema.json')
}

export function getPJData() {
  return readJSON<PJData>('data/pj-data.json')
}

export function savePJData(data: PJData) {
  writeJSON('data/pj-data.json', data)
}

export function getPFData() {
  return readJSON<PFData>('data/pf-data.json')
}

export function savePFData(data: PFData) {
  writeJSON('data/pf-data.json', data)
}
