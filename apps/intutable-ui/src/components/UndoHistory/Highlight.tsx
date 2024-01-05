import React from "react"

export const Highlight: React.FC<{ children: React.ReactNode }> = props => {
    return (
        <code
            style={{
                backgroundColor: "#66b2ff26",
                borderRadius: "5px",
                padding: "2px 7px",
                margin: "0 2px",
                fontWeight: "500",
            }}
        >
            {props.children}
        </code>
    )
}
