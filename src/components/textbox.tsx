
export default function TextBox(props: any) {
    return <div className="mb-3">
        <label className="form-label h5">{props.label}</label>
            <input aria-autocomplete="none" readOnly={props.readonly} autoComplete="new-password" id={props.id} placeholder={props.placehoder}  disabled={props.disabled} type="text" name={props.name} value={props.values[props.name]} onChange={props.onChange} className="form-control" />
    </div>
}