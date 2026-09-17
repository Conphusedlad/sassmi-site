export const IS_ARTIFACT = import.meta.env.VITE_TARGET === 'artifact'
export const asset = (path: string) => (IS_ARTIFACT ? path.replace(/^\//, './') : path)
