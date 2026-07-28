import { requireAuth } from "lib/guards";
import { AssignmentsPage, loadWorkItems } from ".";

/** Same view as /learn/assignments, filtered to approved work by default. */
const CompletedWorkPage = AssignmentsPage;

export const getServerSideProps = requireAuth(async ({ userId }) => {
    const { items, badgeCount, certificateCount } = await loadWorkItems(userId);
    return {
        props: { items, badgeCount, certificateCount, completedView: true },
    };
});

export default CompletedWorkPage;
