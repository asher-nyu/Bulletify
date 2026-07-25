import ConverterPage from '../components/ConverterPage';
import { convertProjectText } from '../convertProjectText';

export default function ProjectPage() {
  return <ConverterPage convert={convertProjectText} label="Project" page="project" />;
}
