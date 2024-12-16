"use client";

import { RecoilRoot } from "recoil";

interface IRecoilContextProviderProps {
    children: React.ReactNode;
}

export const RecoilContextProvider: React.FC<IRecoilContextProviderProps> = ({
    children,
}) => <RecoilRoot>{children}</RecoilRoot>;

export default RecoilContextProvider;
