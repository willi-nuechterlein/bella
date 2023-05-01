import { langTools } from './langchainTools'
import { customSerp } from './customSerp'
import { bitcoinPrice } from './bitcoinPrice'

export const noPermissiontools = [...langTools, bitcoinPrice]

export const permissionTools = [customSerp]

export const tools = [...noPermissiontools, ...permissionTools]
