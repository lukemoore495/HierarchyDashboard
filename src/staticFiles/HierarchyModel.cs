namespace Models
{
    public class Hierarchy
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public List<Node> Nodes { get; set; }
        public List<Alternative> Alternatives { get; set; }
    }

    public class Node
    {
        public string Name { get; set; }
        public int Weight { get; set; }
        List<Node> Children { get; set; }
        public string icon { get; set; }
  }

  public class LeafNode: Node
    {
        public string MeasurementName { get; set; }
        public MeasurementType MeasurementType { get; set; }
        public ValueFunction ValueFunction { get; set; }
    }

    public class Alternative
    {
        public string Name { get; set; }  
        public List<Measurement> Measurements { get; set; }
        public int Rank { get; set; }
    }

    public class Measurement
    {
        public LeafNode LeafNode { get; set; }
        public double Measure { get; set; }
        public double Value { get; set; }
    }

    public interface ValueFunction
    {
        public double calculateValue(int weight, int value);
    }

    public class ContinuousValueFunction: ValueFunction
    {
        private enum Type
        {
            Increasing,
            Decreasing
        }
        public double UpperBound { get; set; }
        public double LowerBound { get; set; }
        public Type Type { get; set; }


    public double calculateValue(int weight, int value)
        {
            return value;
        }
    }

    public class CategoricalValueFunction : ValueFunction
    {
        public List<Categories> RowCategories { get; set; }
        public List<Categories> ColumnCategories { get; set; }
        private enum Type
        {
            OneDimension,
            TwoDimension
        }
        public double calculateValue(int weight, int value)
        {
            return value;
        }
    }

    public class Categories
    {
        public string Name { get; set;}
        public double Value { get; set;}
    }

    public enum MeasurementType
    {
        Number,
        Percentage,
        Boolean
    }
}
