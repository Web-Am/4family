
export default function Button(props: any) {
    return <button className="btn btn-primary" onClick={props.onClick}>{props.label}</button>
}