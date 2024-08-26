
export default function LinkBox(props: any) {

    return <div className="mb-3">
        <label className="form-label h5">{props.label}</label>
        <a href={props.href} className="form-control mx-auto btn btn-link border text-decoration-none" target="_blank">{props.children}</a>
    </div>
}