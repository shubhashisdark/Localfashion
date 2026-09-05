import type { ImgHTMLAttributes } from "react";

export function RemoteImage(props: ImgHTMLAttributes<HTMLImageElement>) {
  return <img {...props} alt={props.alt ?? ""} />;
}
