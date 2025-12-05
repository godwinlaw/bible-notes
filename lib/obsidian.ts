export interface ObsidianConfig {
    apiKey: string;
    port: string;
    exportPath?: string;
}

export async function exportToObsidian(
    title: string,
    content: string,
    config: ObsidianConfig
): Promise<{ success: boolean; message: string }> {
    if (!config.apiKey) {
        return { success: false, message: "Obsidian API Key is missing. Please configure it in Settings." };
    }

    const port = config.port || '27123';
    const baseUrl = `https://127.0.0.1:${port}`;

    // Sanitize title for filename
    const filename = title.replace(/[\\/:*?"<>|]/g, "-") || "Untitled Note";

    // Construct path
    let path = filename;
    if (config.exportPath) {
        // Remove leading/trailing slashes from config path
        const cleanPath = config.exportPath.replace(/^\/+|\/+$/g, '');
        if (cleanPath) {
            path = `${cleanPath}/${filename}`;
        }
    }

    const endpoint = `${baseUrl}/vault/${encodeURIComponent(path)}.md`;

    try {
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'text/markdown',
                'Accept': 'application/json'
            },
            body: content
        });

        if (response.ok) {
            return { success: true, message: "Note exported to Obsidian successfully!" };
        } else {
            const errorText = await response.text();
            return { success: false, message: `Failed to export: ${response.status} ${response.statusText} - ${errorText}` };
        }
    } catch (error) {
        console.error("Obsidian export error:", error);
        return {
            success: false,
            message: "Failed to connect to Obsidian. Ensure Obsidian is running with the Local REST API plugin enabled and the port is correct. Note: Self-signed certificates might be blocked by your browser."
        };
    }
}
