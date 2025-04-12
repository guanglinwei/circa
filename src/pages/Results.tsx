import { useContext } from "react";
import DataContext from "../context/DataContext";

function Results() {
    const { userData, loadFirebaseUserData } = useContext(DataContext);
    return (
        <div>
            <h1>Results</h1>
            <div>
                <button onClick={() => {
                    loadFirebaseUserData();
                }}>whats in db</button>
            </div>
            <div>
                {userData ? userData.map((doc, i) => <div key={i}>
                {doc.name}</div>) : <></>}
            </div>
        </div>
    );
}

export default Results;