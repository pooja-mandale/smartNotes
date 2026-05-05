export interface MindMapNode {
    id: string;
    text: string;
    level: number;
    children: MindMapNode[];
}

export function parseMindMapFromNote(content: string, title: string): MindMapNode {
    const root: MindMapNode = {
        id: 'root',
        text: title,
        level: 0,
        children: []
    };

    if (!content) return root;

    const lines = content.split('\n');
    const stack: MindMapNode[] = [root];

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        let level = 0;
        let text = trimmed;

        if (trimmed.startsWith('#')) {
            const match = trimmed.match(/^(#+)\s*(.+)/);
            if (match) {
                level = match[1].length;
                text = match[2];
            }
        } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
            level = stack[stack.length - 1].level + 1;
            text = trimmed.replace(/^[-*]\s*/, '');
        } else {
            // Text block
            level = stack[stack.length - 1].level + 1;
        }

        const node: MindMapNode = {
            id: `node-${index}`,
            text,
            level,
            children: []
        };

        // Find parent
        while (stack.length > 1 && stack[stack.length - 1].level >= level) {
            stack.pop();
        }

        const parent = stack[stack.length - 1];
        parent.children.push(node);
        stack.push(node);
    });

    return root;
}
