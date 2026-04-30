export interface WranglerBindings {
    d1?: {
        binding: string;
        database_name: string;
        database_id: string;
    }[];
    r2?: {
        binding: string;
        bucket_name: string;
    }[];
    kv?: {
        binding: string;
        id: string;
    }[];
}
type WranglerFormat = 'jsonc' | 'toml';
export declare function readWranglerConfig(cwd: string): Promise<{
    raw: string;
    format: WranglerFormat;
}>;
/** @deprecated use readWranglerConfig */
export declare function readWranglerToml(cwd: string): Promise<string>;
export declare function parseWranglerBindings(rawOrToml: string, format?: WranglerFormat): WranglerBindings;
export declare function validateBindings(bindings: WranglerBindings): string[];
export {};
//# sourceMappingURL=wrangler.d.ts.map