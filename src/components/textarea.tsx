
export default function TextArea(props: any) {
    return <div className="mb-3">
        <label className="form-label h5">{props.label}</label>
        <textarea rows={4} aria-autocomplete="none" readOnly={props.readonly} autoComplete="new-password" id={props.id} placeholder={props.placehoder} disabled={props.disabled}  name={props.name} value={props.values[props.name]} onChange={props.onChange} className="form-control" />
    </div>
}