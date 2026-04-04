import React from "react";
import { Code, DataList } from "@radix-ui/themes";

/**
 * A lightweight component for displaying the No Man's Sky "Easter Egg" coordinates.
 * This is lazily loaded to strip the DataList, Code, and static text from the critical path bundle.
 *
 * @returns {JSX.Element} The rendered list of coordinates.
 * @example
 */
const EasterEggCoordinates: React.FC = () => {
	return (
		<DataList.Root size="1">
			<DataList.Item align="center">
				<DataList.Label className="nmsFont--header text-base">Euclid</DataList.Label>
			</DataList.Item>
			<DataList.Item align="center">
				<DataList.Label className="nmsFont">Olamsk Spaceport</DataList.Label>
				<DataList.Value>
					<Code>0356:0085:0D17:006C</Code>
				</DataList.Value>
			</DataList.Item>
			<DataList.Item align="center">
				<DataList.Label className="nmsFont--header text-base">Ityanianat</DataList.Label>
			</DataList.Item>
			<DataList.Item align="center">
				<DataList.Label className="nmsFont">Mountain House</DataList.Label>
				<DataList.Value>
					<Code>0CEE:0085:0CCF:040D</Code>
				</DataList.Value>
			</DataList.Item>
			<DataList.Item align="center">
				<DataList.Label className="nmsFont--header text-base">Odyalutai</DataList.Label>
			</DataList.Item>
			<DataList.Item align="center">
				<DataList.Label className="nmsFont">Faye Sigma Fishing Resort</DataList.Label>
				<DataList.Value>
					<Code>07EE:008A:07EF:03E9</Code>
				</DataList.Value>
				<DataList.Label className="nmsFont">Sanctum Zero</DataList.Label>
				<DataList.Value>
					<Code>07E9:0088:07ED:0404</Code>
				</DataList.Value>
			</DataList.Item>
		</DataList.Root>
	);
};

export default EasterEggCoordinates;
