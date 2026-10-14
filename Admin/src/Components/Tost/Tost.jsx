import './Tost.css';
import { MdOutlineDownloadDone } from "react-icons/md";
import { BiSolidMessageSquareError } from "react-icons/bi";
import { CiWarning } from "react-icons/ci";
import { CiCircleInfo } from "react-icons/ci";

export default function Tost({description,status}) {
    
    return (

        <dev className={`tost tost-${status}`}>

            <div className="top-tost">
            <span className="tost-icon">
                {status == "success" ? <MdOutlineDownloadDone /> : "error" ? <BiSolidMessageSquareError /> : "warning" ? <CiWarning /> : "info" ? <CiCircleInfo /> : ''}
            </span>
            <strong className="tost-title">
                {status}
            </strong>
            </div>

            <p className="tost-description">
                {description}
            </p>
        </dev>
)
}