import { requireAuth } from "lib/guards";
import { loadWorkItems } from "lib/work-items";
import { AssignmentsPage } from ".";

/** Same view as /learn/assignments, filtered to approved work by default. */
const CompletedWorkPage = AssignmentsPage;

export const getServerSideProps = requireAuth(async ({ userId, role }) => {
    const { items, badgeCount, certificateCount } = await loadWorkItems(userId);
    return {
        props: {
            role,
            items,
            badgeCount,
            certificateCount,
            completedView: true,
        },
    };
});

export default CompletedWorkPage;
