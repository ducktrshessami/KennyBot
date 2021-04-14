import "./Loading.css";

export default function Loading(props) {
    let propClass = props.className || "";
    let propColor = props.color || "";
    return (
        <div className={`loading-${props.size} ${propClass}`}>
            <div className={`preloader-wrapper ${props.size} active`}>
                <div className={`spinner-layer ${propColor}-loading`}>
                    <div className="circle-clipper left">
                        <div className="circle"></div>
                    </div><div className="gap-patch">
                        <div className="circle"></div>
                    </div><div className="circle-clipper right">
                        <div className="circle"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
