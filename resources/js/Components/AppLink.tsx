import { Link as InertiaLink } from '@inertiajs/react';
import type { ComponentProps } from 'react';

type Props = Omit<ComponentProps<typeof InertiaLink>, 'href'> & {
    to: string;
};

export function Link({ to, ...props }: Props) {
    return <InertiaLink href={to} {...props} />;
}
