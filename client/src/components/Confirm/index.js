import "./Confirm.css";

export default function Confirm(props) {
    return (
        <section>
            <div className="confirm-background" />
            <div className="confirm-wrapper row">
                <div className="confirm-card card nqb-bg col s10 m6 l4 offset-s1 offset-m3 offset-l4">
                    <div className="card-content">
                        {props.title ? <div className="card-title">{props.title}</div> : undefined}
                        {props.body ? <p>{props.body}</p> : undefined}
                    </div>
                    <div className="card-action">
                        <button className="confirm-button btn greyple-bg focus-lighten right" onClick={props.onCancel}>Cancel</button>
                        <button className="confirm-button btn kenny-bg focus-lighten right" onClick={props.onOk}>Ok</button>
                    </div>
                </div>
            </div>
        </section>
    );
};
