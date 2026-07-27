function TableControls() {
    return (
        <form>
            <input type="search" name="pattern" id="pattern" />
        </form>
    );
}

export default function Datatable() {
    return (
        <table>
            <caption>
                Proyects
            </caption>
            <thead>
                <th>Status</th>
                <th>Deadline </th>
                <th>Team member </th>
                <th>Budget </th>
            </thead>
            <tbody>

            </tbody>
        </table>
    );
}