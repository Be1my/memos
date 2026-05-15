import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_memos/home')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/_protected/home"!</div>
}
