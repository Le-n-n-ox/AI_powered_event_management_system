interface Props {
  data: any;
  updateData: (field: string, value: any) => void;
  inputCls: string;
}

export default function DateTimeSection({ data, updateData, inputCls }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-gray-900">Date & Time</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
          <input
            type="datetime-local"
            value={data.startDate}
            onChange={(e) => updateData("startDate", e.target.value)}
            required
            className={`w-full ${inputCls}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
          <input
            type="datetime-local"
            value={data.endDate}
            onChange={(e) => updateData("endDate", e.target.value)}
            required
            className={`w-full ${inputCls}`}
          />
        </div>
      </div>
    </div>
  );
}