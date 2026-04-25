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
export declare function readWranglerToml(cwd: string): Promise<string>;
export declare function parseWranglerBindings(toml: string): WranglerBindings;
export declare function appendToWranglerToml(cwd: string, additions: string): Promise<void>;
export declare function validateBindings(bindings: WranglerBindings): string[];
//# sourceMappingURL=wrangler.d.ts.map