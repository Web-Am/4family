
export default function FileBox(props: any) {
    return <div className="mb-3">
        <label className="form-label h5">{props.label}</label>
        <input type="file" className="btn btn-block btn-outline-dark w-100" name={props.name} onChange={props.onChange} />
    </div>
}