import { useContext } from "react";
import DataContext from "../context/DataContext";
import Plot from "../components/Plot";

function Results() {
    const { userData, loadFirebaseUserData } = useContext(DataContext);
    return (
        <div>
            <h1>Results</h1>
            <div>
                <button onClick={() => {
                    loadFirebaseUserData?.();
                }}>whats in db</button>
            </div>
            <div>
                {/* {userData ? userData.map((doc, i) => <div key={i}>
                {doc.points.map((v) => <p>{v.x}, {v.y}</p>)}</div>) : <></>} */}
                {userData ? <Plot /> : <></>}
            </div>
        </div>
    );
}

export default Results;