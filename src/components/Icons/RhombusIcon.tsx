import React from "react";

const RhombusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M12 2L22 12L12 22L2 12L12 2Z"
			fill="currentColor"
		/>
	</svg>
);

export default RhombusIcon;
