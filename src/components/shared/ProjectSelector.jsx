import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';

export default function ProjectSelector({ value, onChange, entityId, allowNull = false, allowCreate = false }) {
  const { projects } = useProjects();
  const filtered = entityId ? projects.filter(p => p.entity_id === entityId) : projects;

  return (
    <div className="flex gap-2 items-center">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Select Project" /></SelectTrigger>
        <SelectContent>
          {allowNull && <SelectItem value="">None</SelectItem>}
          {filtered.map(p => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {allowCreate && <Button size="sm" variant="outline">+ New</Button>}
    </div>
  );
}
