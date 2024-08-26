
export default function SelectBox(props: any) {

    const onChangeLocal =(event: any)=>{

        if(props.multiple==true)
        {
            const { options } = event.target;
            const selectedValues = [];
            for (let i = 0; i < options.length; i++) {
              if (options[i].selected) {
                selectedValues.push(options[i].value);
              }
            }
            props.onChange({ target: { name: props.name, value: selectedValues } } as any);
        }
        else
        {
            props.onChange(event);
        }
    }

    return <div className="mb-3">
        <label className="form-label h5">{props.label}</label>
        <select role="button" disabled={props.disabled} multiple={props.multiple} className="form-control" onChange={onChangeLocal} name={props.name} value={props.values[props.name]}>
            <option value="" hidden>-</option>
            {props.children}
        </select>
    </div>
}