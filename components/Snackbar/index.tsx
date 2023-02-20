import React from "react";

const Snack = () => {
    return (
        <div className="bg-dark-grey-primary p-3 rounded-full border
         border-[rgba(255,255,255,0.1)]">
            <p className="text-white text-sm">Copied Department Email!</p>
        </div>
    )
}

const Snackbar = () => {
    return (
        <div data-component="Snackbar" className="fixed bottom-[7.5%] left-1/2 -translate-x-1/2">
            <Snack />
        </div>
    )
}

export default Snackbar;