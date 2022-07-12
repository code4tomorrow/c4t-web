import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { useStyles } from "./styles";
import gsap from "gsap";

const Volunteer = () => {
    const { classes } = useStyles();
    const [ hover, setHover ] = useState(false);

    return (
      <div>
        <div 
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className={clsx(
              "w-[300px] h-[400px] relative rounded-sm overflow-hidden bg-dark-grey-secondary",
              "after:bg-gradient-to-r after:from-brand-green after:to-brand-green", 
              classes.container,
              classes.flow
          )}>
            
        </div>
      </div>
    )
}

export default Volunteer; 