"use client";

interface UploadFileAddProps {
    onFileClick: () => void;
    onOneChamberClick?: () => void;
}

const UploadFileAdd = ({onFileClick, onOneChamberClick}: UploadFileAddProps) => {
    return (
        <>
            <div className="DEWSContextPop flex-1 v-box">
                <ul className='dataFileSel'>
                    <li onClick={onFileClick} className="pc">
                        내 컴퓨터(이미지만 지원)
                    </li>
                    <li onClick={onOneChamberClick || (() => alert("OneChamberClick 연결"))}
                        className="onechamber"
                    >
                        ONE CHAMBER
                    </li>
                </ul>
            </div>
        </>

    );
};

export default UploadFileAdd;
