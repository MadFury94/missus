interface StructuredDataProps {
    schema: Record<string, any> | Array<Record<string, any>>;
}

export default function StructuredData({ schema }: StructuredDataProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(Array.isArray(schema) ? schema : [schema])
            }}
        />
    );
}

// Convenience component for multiple schemas
export function MultipleStructuredData({ schemas }: { schemas: Array<Record<string, any>> }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(schemas)
            }}
        />
    );
}