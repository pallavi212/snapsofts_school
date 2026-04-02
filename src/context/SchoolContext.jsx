import React, { createContext, useContext, useEffect, useState } from 'react';
import { schoolApi } from '../api';

const SchoolContext = createContext({});

export const SchoolProvider = ({ children }) => {
    const [school, setSchool] = useState({});

    useEffect(() => {
        schoolApi.get()
            .then(setSchool)
            .catch(() => { }); // fail silently — not critical
    }, []);

    return (
        <SchoolContext.Provider value={school}>
            {children}
        </SchoolContext.Provider>
    );
};

export const useSchool = () => useContext(SchoolContext);
