import { formatDate } from "@/lib/utils";

export function SubmissionTable({
  submissions,
}: {
  submissions: Array<{
    id: string;
    studentName: string;
    labTitle: string;
    score: number;
    status: string;
    createdAt: Date | string;
  }>;
}) {
  return (
    <div className="overflow-x-auto rounded-[24px] border border-white/8">
      <table className="min-w-full divide-y divide-white/8 text-sm">
        <thead className="bg-white/[0.03] text-left text-white/45">
          <tr>
            <th className="px-4 py-3 font-medium">Студент</th>
            <th className="px-4 py-3 font-medium">Лабораторная</th>
            <th className="px-4 py-3 font-medium">Оценка</th>
            <th className="px-4 py-3 font-medium">Статус</th>
            <th className="px-4 py-3 font-medium">Дата</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/6 text-white/75">
          {submissions.map((submission) => (
            <tr key={submission.id}>
              <td className="px-4 py-4">{submission.studentName}</td>
              <td className="px-4 py-4">{submission.labTitle}</td>
              <td className="px-4 py-4">{submission.score}%</td>
              <td className="px-4 py-4">
                <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-2 py-1 text-xs text-fuchsia-200">
                  {submission.status}
                </span>
              </td>
              <td className="px-4 py-4 text-white/45">{formatDate(submission.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
