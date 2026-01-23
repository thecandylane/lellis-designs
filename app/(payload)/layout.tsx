/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import type { ServerFunctionClient } from 'payload'

import config from '@payload-config'
import { RootLayout } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './admin/importMap'
import '@payloadcms/next/css'
import './admin/custom.css'

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  const { getPayload } = await import('payload')
  const payloadInstance = await getPayload({ config })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fn = (payloadInstance as any).serverFunctions?.[args.name]
  if (fn) {
    return fn(args)
  }
  throw new Error(`Server function ${args.name} not found`)
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
