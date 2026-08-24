import { GetMonitoring } from '../../wailsjs/go/binding/Monitoring'

export const fetchGetMonitoring = async (clusterCtx: string, range: string) => GetMonitoring(clusterCtx, range)
