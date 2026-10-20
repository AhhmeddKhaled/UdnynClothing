import styles from "./Table.module.css";

export default function Tables({tableHeader,tableBody,tableFooter}) {

    <table>
        <thead>
            <tr>
                {tableHeader.map((th) => (
                    <th key={th}>{th}</th>
                ))}
            </tr>
        </thead>

        <tbody>
            Test
        </tbody>
    </table>
}