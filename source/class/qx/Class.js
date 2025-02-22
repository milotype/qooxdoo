/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * John Spackman (john.spackman@zenesis.com)

************************************************************************ */

/**
 * This class is one of the most important parts of qooxdoo's
 * object-oriented features.
 *
 * Its {@link #define} method is used to create qooxdoo classes.
 *
 * Each instance of a class defined by {@link #define} has
 * the following keys attached to the constructor and the prototype:
 *
 * <table>
 * <tr><th><code>classname</code></th><td>The fully-qualified name of the class (e.g. <code>"qx.ui.core.Widget"</code>).</td></tr>
 * <tr><th><code>basename</code></th><td>The namespace part of the class name (e.g. <code>"qx.ui.core"</code>).</td></tr>
 * <tr><th><code>constructor</code></th><td>A reference to the constructor of the class.</td></tr>
 * <tr><th><code>superclass</code></th><td>A reference to the constructor of the super class.</td></tr>
 * </table>
 *
 * Each method may access static members of the same class by using
 * <code>this.self(arguments)</code> ({@link qx.core.Object#self}):
 * <pre class='javascript'>
 * statics : { FOO : "bar" },
 * members: {
 *   baz: function(x) {
 *     this.self(arguments).FOO;
 *     ...
 *   }
 * }
 * </pre>
 *
 * Each overriding method may call the overridden method by using
 * <code>this.base(arguments [, ...])</code> ({@link qx.core.Object#base}). This is also true for calling
 * the constructor of the superclass.
 * <pre class='javascript'>
 * members: {
 *   foo: function(x) {
 *     this.base(arguments, x);
 *     ...
 *   }
 * }
 * </pre>
 *
 * By using <code>qx.Class</code> within an app, the native JS data types are
 * conveniently polyfilled according to {@link qx.lang.normalize}.
 *
 * Annotations can be added to classes, constructors, destructors, and methods, properties, and statics -
 * see <code>qx.Annotation</code> for examples and means access annotations at runtime.
 *
 * @require(qx.Interface)
 * @require(qx.Mixin)
 * @require(qx.lang.normalize.Array)
 * @require(qx.lang.normalize.Date)
 * @require(qx.lang.normalize.Error)
 * @require(qx.lang.normalize.Function)
 * @require(qx.lang.normalize.String)
 * @require(qx.lang.normalize.Object)
 * @require(qx.lang.normalize.Number)
 */
qx.Bootstrap.define("qx.Class", {
  statics: {
    /**
     * A static reference to the property implementation in the case it
     * should be included.
     */
    __Property: qx.core.Environment.get("module.property")
      ? qx.core.Property
      : null,

    /*
    ---------------------------------------------------------------------------
       PUBLIC METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Define a new class using the qooxdoo class system. This sets up the
     * namespace for the class and generates the class from the definition map.
     *
     * Example:
     * <pre class='javascript'>
     * qx.Class.define("name",
     * {
     *   extend : Object, // superclass
     *   implement : [Interfaces],
     *   include : [Mixins],
     *
     *   statics:
     *   {
     *     CONSTANT : 3.141,
     *
     *     publicMethod: function() {},
     *     _protectedMethod: function() {},
     *     __privateMethod: function() {}
     *   },
     *
     *   properties:
     *   {
     *     "tabIndex": { check: "Number", init : -1 }
     *   },
     *
     *   members:
     *   {
     *     publicField: "foo",
     *     publicMethod: function() {},
     *
     *     _protectedField: "bar",
     *     _protectedMethod: function() {},
     *
     *     __privateField: "baz",
     *     __privateMethod: function() {}
     *   }
     * });
     * </pre>
     *
     * @param name {String?null} Name of the class. If <code>null</code>, the class
     *   will not be added to any namespace which could be handy for testing.
     * @param config {Map ? null} Class definition structure. The configuration map has the following keys:
     *     <table>
     *       <tr><th>Name</th><th>Type</th><th>Description</th></tr>
     *       <tr><th>type</th><td>String</td><td>
     *           Type of the class. Valid types are "abstract", "static" and "singleton".
     *           If unset it defaults to a regular non-static class.
     *       </td></tr>
     *       <tr><th>extend</th><td>Class</td><td>The super class the current class inherits from.</td></tr>
     *       <tr><th>implement</th><td>Interface | Interface[]</td><td>Single interface or array of interfaces the class implements.</td></tr>
     *       <tr><th>include</th><td>Mixin | Mixin[]</td><td>Single mixin or array of mixins, which will be merged into the class.</td></tr>
     *       <tr><th>construct</th><td>Function</td><td>The constructor of the class.</td></tr>
     *       <tr><th>statics</th><td>Map</td><td>Map of static members of the class.</td></tr>
     *       <tr><th>properties</th><td>Map</td><td>Map of property definitions. For a description of the format of a property definition see
     *           {@link qx.core.Property}.</td></tr>
     *       <tr><th>members</th><td>Map</td><td>Map of instance members of the class.</td></tr>
     *       <tr><th>environment</th><td>Map</td><td>Map of environment settings for this class. For a description of the format of a setting see
     *           {@link qx.core.Environment}.</td></tr>
     *       <tr><th>events</th><td>Map</td><td>
     *           Map of events the class fires. The keys are the names of the events and the values are the
     *           corresponding event type class names.
     *       </td></tr>
     *       <tr><th>defer</th><td>Function</td><td>Function that is called at the end of processing the class declaration. It allows access to the declared statics, members and properties.</td></tr>
     *       <tr><th>destruct</th><td>Function</td><td>The destructor of the class.</td></tr>
     *     </table>
     * @return {Class} The defined class
     */
    define(name, config) {
      try {
        return this.__defineImpl(name, config);
      } catch (ex) {
        qx.Class.$$brokenClassDefinitions = true;
        throw ex;
      }
    },

    /**
     * Implementation behind `define` - this exists just for the simplicity of wrapping an exception
     * handler around the code
     *
     * @param {String} name @see `define()`
     * @param {*} config @see `define()`
     * @returns  @see `define()`
     */
    __defineImpl(name, config) {
      if (!config) {
        config = {};
      }

      // Normalize include to array
      if (
        config.include &&
        !(qx.Bootstrap.getClass(config.include) === "Array")
      ) {
        config.include = [config.include];
      }

      // Normalize implement to array
      if (
        config.implement &&
        !(qx.Bootstrap.getClass(config.implement) === "Array")
      ) {
        config.implement = [config.implement];
      }

      // Normalize type
      var implicitType = false;
      if (!config.hasOwnProperty("extend") && !config.type) {
        config.type = "static";
        implicitType = true;
      }

      // Validate incoming data
      if (qx.core.Environment.get("qx.debug")) {
        try {
          this.__validateConfig(name, config);
        } catch (ex) {
          if (implicitType) {
            ex.message =
              'Assumed static class because no "extend" key was found. ' +
              ex.message;
          }
          throw ex;
        }
      }

      // Create the class
      var clazz = this.__createClass(
        name,
        config.type,
        config.extend,
        config.statics,
        config.construct,
        config.destruct,
        config.include
      );

      // Initialise class and constructor/destructor annotations
      ["@", "@construct", "@destruct"].forEach(function (id) {
        this.__attachAnno(clazz, id, null, config[id]);
      }, this);

      // Members, properties, events and mixins are only allowed for non-static classes
      if (config.extend) {
        // Attach properties
        if (config.properties) {
          this.__addProperties(clazz, config.properties, true);
        }

        // Attach members
        if (config.members) {
          this.__addMembers(clazz, config.members, true, true, false);
        }

        // Process events
        if (config.events) {
          this.__addEvents(clazz, config.events, true);
        }

        // Include mixins
        // Must be the last here to detect conflicts
        if (config.include) {
          for (var i = 0, l = config.include.length; i < l; i++) {
            this.__addMixin(clazz, config.include[i], false);
          }
        }
      }
      // If config has a 'extend' key but it's null or undefined
      else if (
        config.hasOwnProperty("extend") &&
        qx.core.Environment.get("qx.debug")
      ) {
        throw new Error('"extend" parameter is null or undefined');
      }

      // Process environment
      if (config.environment) {
        for (var key in config.environment) {
          qx.core.Environment.add(key, config.environment[key]);
        }
      }

      // Interface support for non-static classes
      if (config.implement) {
        for (var i = 0, l = config.implement.length; i < l; i++) {
          this.__addInterface(clazz, config.implement[i]);
        }
      }

      if (qx.core.Environment.get("qx.debug")) {
        this.__validateAbstractInterfaces(clazz);
      }

      // Process defer
      if (config.defer) {
        config.defer.self = clazz;
        qx.Bootstrap.addPendingDefer(clazz, function () {
          clazz = qx.Class.getByName(clazz.classname);
          config.defer(clazz, clazz.prototype, {
            add(name, config) {
              // build pseudo properties map
              var properties = {};
              properties[name] = config;

              // execute generic property handler
              qx.Class.__addProperties(clazz, properties, true);
            }
          });
        });
      }

      return clazz;
    },

    /**
     * Removes a class from qooxdoo defined by {@link #define}
     *
     * @param name {String} Name of the class
     */
    undefine(name) {
      // first, delete the class from the registry
      delete this.$$registry[name];
      // delete the class reference from the namespaces and all empty namespaces
      var ns = name.split(".");
      // build up an array containing all namespace objects including window
      var objects = [window];
      for (var i = 0; i < ns.length; i++) {
        objects.push(objects[i][ns[i]]);
      }

      // go through all objects and check for the constructor or empty namespaces
      for (var i = objects.length - 1; i >= 1; i--) {
        var last = objects[i];
        var parent = objects[i - 1];
        if (
          // The class being undefined, but parent classes in case it is a nested class that is being undefined
          (i == objects.length - 1 && qx.Bootstrap.isFunction(last)) ||
          qx.Bootstrap.objectGetLength(last) === 0
        ) {
          delete parent[ns[i - 1]];
        } else {
          break;
        }
      }
    },

    /**
     * Whether the given class exists
     *
     * @signature function(name)
     * @param name {String} class name to check
     * @return {Boolean} true if class exists
     */
    isDefined: qx.util.OOUtil.classIsDefined,

    /**
     * Determine the total number of classes
     *
     * @return {Number} the total number of classes
     */
    getTotalNumber() {
      return qx.Bootstrap.objectGetLength(this.$$registry);
    },

    /**
     * Find a class by its name
     *
     * @signature function(name)
     * @param name {String} class name to resolve
     * @return {Class} the class
     */
    getByName: qx.Bootstrap.getByName,

    /**
     * Include all features of the given mixin into the class. The mixin must
     * not include any methods or properties that are already available in the
     * class. This would only be possible using the {@link #patch} method.
     *
     * @param clazz {Class} An existing class which should be augmented by including a mixin.
     * @param mixin {Mixin} The mixin to be included.
     */
    include(clazz, mixin) {
      if (qx.core.Environment.get("qx.debug")) {
        if (!mixin) {
          throw new Error(
            "The mixin to include into class '" +
              clazz.classname +
              "' is undefined/null!"
          );
        }

        qx.Mixin.isCompatible(mixin, clazz);
      }

      qx.Class.__addMixin(clazz, mixin, false);
    },

    /**
     * Include all features of the given mixin into the class. The mixin may
     * include features, which are already defined in the target class. Existing
     * features of equal name will be overwritten.
     * Please keep in mind that this functionality is not intended for regular
     * use, but as a formalized way (and a last resort) in order to patch
     * existing classes.
     *
     * <b>WARNING</b>: You may break working classes and features.
     *
     * @param clazz {Class} An existing class which should be modified by including a mixin.
     * @param mixin {Mixin} The mixin to be included.
     * @return {Class} the new class definition
     */
    patch(clazz, mixin) {
      if (qx.core.Environment.get("qx.debug")) {
        if (!mixin) {
          throw new Error(
            "The mixin to patch class '" +
              clazz.classname +
              "' is undefined/null!"
          );
        }

        qx.Mixin.isCompatible(mixin, clazz);
      }

      qx.Class.__addMixin(clazz, mixin, true);
      return qx.Class.getByName(clazz.classname);
    },

    /**
     * Detects whether the object is a Class (and not an instance of a class)
     *
     *  @param obj {Object?} the object to inspect
     *  @return {Boolean} true if it is a class, false if it is anything else
     */
    isClass(obj) {
      return obj && obj.$$type === "Class" && obj.constructor === obj;
    },

    /**
     * Whether a class is a direct or indirect sub class of another class,
     * or both classes coincide.
     *
     * @param clazz {Class} the class to check.
     * @param superClass {Class} the potential super class
     * @return {Boolean} whether clazz is a sub class of superClass.
     */
    isSubClassOf(clazz, superClass) {
      if (!clazz) {
        return false;
      }

      if (clazz == superClass) {
        return true;
      }

      if (clazz.prototype instanceof superClass) {
        return true;
      }

      return false;
    },

    /**
     * Returns the definition of the given property. Returns null
     * if the property does not exist.
     *
     * @signature function(clazz, name)
     * @param clazz {Class} class to check
     * @param name {String} name of the class to check for
     * @return {Map|null} whether the object support the given event.
     */
    getPropertyDefinition: qx.util.OOUtil.getPropertyDefinition,

    /**
     * Returns a list of all properties supported by the given class
     *
     * @param clazz {Class} Class to query
     * @return {String[]} List of all property names
     */
    getProperties(clazz) {
      var list = [];

      while (clazz) {
        if (clazz.$$properties) {
          list.push.apply(list, Object.keys(clazz.$$properties));
        }

        clazz = clazz.superclass;
      }

      return list;
    },

    /**
     * Returns the class or one of its superclasses which contains the
     * declaration for the given property in its class definition. Returns null
     * if the property is not specified anywhere.
     *
     * @param clazz {Class} class to look for the property
     * @param name {String} name of the property
     * @return {Class | null} The class which includes the property
     */
    getByProperty(clazz, name) {
      while (clazz) {
        if (clazz.$$properties && clazz.$$properties[name]) {
          return clazz;
        }

        clazz = clazz.superclass;
      }

      return null;
    },

    /**
     * Whether a class has the given property
     *
     * @signature function(clazz, name)
     * @param clazz {Class} class to check
     * @param name {String} name of the property to check for
     * @return {Boolean} whether the class includes the given property.
     */
    hasProperty: qx.util.OOUtil.hasProperty,

    /**
     * Returns the event type of the given event. Returns null if
     * the event does not exist.
     *
     * @signature function(clazz, name)
     * @param clazz {Class} class to check
     * @param name {String} name of the event
     * @return {String|null} Event type of the given event.
     */
    getEventType: qx.util.OOUtil.getEventType,

    /**
     * Whether a class supports the given event type
     *
     * @signature function(clazz, name)
     * @param clazz {Class} class to check
     * @param name {String} name of the event to check for
     * @return {Boolean} whether the class supports the given event.
     */
    supportsEvent: qx.util.OOUtil.supportsEvent,

    /**
     * Whether a class directly includes a mixin.
     *
     * @param clazz {Class} class to check
     * @param mixin {Mixin} the mixin to check for
     * @return {Boolean} whether the class includes the mixin directly.
     */
    hasOwnMixin(clazz, mixin) {
      return clazz.$$includes && clazz.$$includes.indexOf(mixin) !== -1;
    },

    /**
     * Returns the class or one of its superclasses which contains the
     * declaration for the given mixin. Returns null if the mixin is not
     * specified anywhere.
     *
     * @param clazz {Class} class to look for the mixin
     * @param mixin {Mixin} mixin to look for
     * @return {Class | null} The class which directly includes the given mixin
     */
    getByMixin(clazz, mixin) {
      var list, i, l;

      while (clazz) {
        if (clazz.$$includes) {
          list = clazz.$$flatIncludes;

          for (i = 0, l = list.length; i < l; i++) {
            if (list[i] === mixin) {
              return clazz;
            }
          }
        }

        clazz = clazz.superclass;
      }

      return null;
    },

    /**
     * Returns a list of all mixins available in a given class.
     *
     * @signature function(clazz)
     * @param clazz {Class} class which should be inspected
     * @return {Mixin[]} array of mixins this class uses
     */
    getMixins: qx.util.OOUtil.getMixins,

    /**
     * Whether a given class or any of its superclasses includes a given mixin.
     *
     * @param clazz {Class} class to check
     * @param mixin {Mixin} the mixin to check for
     * @return {Boolean} whether the class includes the mixin.
     */
    hasMixin(clazz, mixin) {
      return !!this.getByMixin(clazz, mixin);
    },

    /**
     * Whether a given class directly includes an interface.
     *
     * This function will only return "true" if the interface was defined
     * in the class declaration ({@link qx.Class#define}) using the "implement"
     * key.
     *
     * @param clazz {Class} class or instance to check
     * @param iface {Interface} the interface to check for
     * @return {Boolean} whether the class includes the mixin directly.
     */
    hasOwnInterface(clazz, iface) {
      return clazz.$$implements && clazz.$$implements.indexOf(iface) !== -1;
    },

    /**
     * Returns the class or one of its super classes which contains the
     * declaration of the given interface. Returns null if the interface is not
     * specified anywhere.
     *
     * @signature function(clazz, iface)
     * @param clazz {Class} class to look for the interface
     * @param iface {Interface} interface to look for
     * @return {Class | null} the class which directly implements the given interface
     */
    getByInterface: qx.util.OOUtil.getByInterface,

    /**
     * Returns a list of all interfaces a given class has to implement.
     *
     * @param clazz {Class} class which should be inspected
     * @return {Interface[]} array of interfaces this class implements
     */
    getInterfaces(clazz) {
      var list = [];

      while (clazz) {
        if (clazz.$$implements) {
          list.push.apply(list, clazz.$$flatImplements);
        }

        clazz = clazz.superclass;
      }

      return list;
    },

    /**
     * Whether a given class or any of its super classes includes a given interface.
     *
     * This function will return "true" if the interface was defined
     * in the class declaration ({@link qx.Class#define}) of the class
     * or any of its super classes using the "implement"
     * key.
     *
     * @signature function(clazz, iface)
     * @param clazz {Class} class to check
     * @param iface {Interface} the interface to check for
     * @return {Boolean} whether the class includes the interface.
     */
    hasInterface: qx.util.OOUtil.hasInterface,

    /**
     * Whether a given class complies to an interface.
     *
     * Checks whether all methods defined in the interface are
     * implemented. The class does not need to implement
     * the interface explicitly in the <code>extend</code> key.
     *
     * @param obj {Object} class to check
     * @param iface {Interface} the interface to check for
     * @return {Boolean} whether the class conforms to the interface.
     */
    implementsInterface(obj, iface) {
      var clazz = obj.constructor;

      if (this.hasInterface(clazz, iface)) {
        return true;
      }

      if (qx.Interface.objectImplements(obj, iface)) {
        return true;
      }

      if (qx.Interface.classImplements(clazz, iface)) {
        return true;
      }

      return false;
    },

    /**
     * Helper method to handle singletons
     *
     * @internal
     * @return {Object} The singleton instance
     */
    getInstance() {
      if (this.$$instance === null) {
        throw new Error(
          "Singleton instance of " +
            this +
            " is requested, but not ready yet. This is most likely due to a recursive call in the constructor path."
        );
      }

      if (!this.$$instance) {
        this.$$allowconstruct = true;
        this.$$instance = null; // null means "object is being created"; needed for another call of getInstance() during instantiation
        this.$$instance = new this();
        delete this.$$allowconstruct;
      }

      return this.$$instance;
    },

    /**
     * Retreive all subclasses of a given class
     *
     * @param clazz {Class} the class which should be inspected
     *
     * @return {Object} class name hash holding the references to the subclasses or null if the class does not exist.
     */
    getSubclasses(clazz) {
      if (!clazz) {
        return null;
      }

      var subclasses = {};
      var registry = qx.Class.$$registry;

      for (var name in registry) {
        if (registry[name].superclass && registry[name].superclass == clazz) {
          subclasses[name] = registry[name];
        }
      }

      return subclasses;
    },

    /*
    ---------------------------------------------------------------------------
       PRIVATE/INTERNAL BASICS
    ---------------------------------------------------------------------------
    */

    /**
     * This method will be attached to all classes to return
     * a nice identifier for them.
     *
     * @internal
     * @return {String} The class identifier
     */
    genericToString() {
      return "[Class " + this.classname + "]";
    },

    /** Stores all defined classes */
    $$registry: qx.Bootstrap.$$registry,

    /** @type {Map} allowed keys in non-static class definition */
    __allowedKeys: qx.core.Environment.select("qx.debug", {
      true: {
        "@": "object",
        "@construct": "object",
        "@destruct": "object",
        type: "string", // String
        extend: "function", // Function
        implement: "object", // Interface[]
        include: "object", // Mixin[]
        construct: "function", // Function
        statics: "object", // Map
        properties: "object", // Map
        members: "object", // Map
        environment: "object", // Map
        events: "object", // Map
        defer: "function", // Function
        destruct: "function" // Function
      },

      default: null
    }),

    /** @type {Map} allowed keys in static class definition */
    __staticAllowedKeys: qx.core.Environment.select("qx.debug", {
      true: {
        "@": "object",
        type: "string", // String
        statics: "object", // Map
        environment: "object", // Map
        defer: "function" // Function
      },

      default: null
    }),

    /**
     * Validates an incoming configuration and checks for proper keys and values
     *
     * @signature function(name, config)
     * @param name {String} The name of the class
     * @param config {Map} Configuration map
     */
    __validateConfig: qx.core.Environment.select("qx.debug", {
      true(name, config) {
        // Validate type
        if (
          config.type &&
          !(
            config.type === "static" ||
            config.type === "abstract" ||
            config.type === "singleton"
          )
        ) {
          throw new Error(
            'Invalid type "' +
              config.type +
              '" definition for class "' +
              name +
              '"!'
          );
        }

        // Validate non-static class on the "extend" key
        if (config.type && config.type !== "static" && !config.extend) {
          throw new Error(
            'Invalid config in class "' +
              name +
              '"! Every non-static class has to extend at least the "qx.core.Object" class.'
          );
        }

        // Validate keys
        var allowed =
          config.type === "static"
            ? this.__staticAllowedKeys
            : this.__allowedKeys;
        for (var key in config) {
          if (!allowed[key]) {
            throw new Error(
              'The configuration key "' +
                key +
                '" in class "' +
                name +
                '" is not allowed!'
            );
          }

          if (config[key] == null) {
            throw new Error(
              'Invalid key "' +
                key +
                '" in class "' +
                name +
                '"! The value is undefined/null!'
            );
          }

          if (typeof config[key] !== allowed[key]) {
            throw new Error(
              'Invalid type of key "' +
                key +
                '" in class "' +
                name +
                '"! The type of the key must be "' +
                allowed[key] +
                '"!'
            );
          }
        }

        // Validate maps
        var maps = [
          "statics",
          "properties",
          "members",
          "environment",
          "settings",
          "variants",
          "events"
        ];

        for (var i = 0, l = maps.length; i < l; i++) {
          var key = maps[i];

          if (
            config[key] !== undefined &&
            (config[key].$$hash !== undefined ||
              !qx.Bootstrap.isObject(config[key]))
          ) {
            throw new Error(
              'Invalid key "' +
                key +
                '" in class "' +
                name +
                '"! The value needs to be a map!'
            );
          }
        }

        // Validate include definition
        if (config.include) {
          if (qx.Bootstrap.getClass(config.include) === "Array") {
            for (var i = 0, a = config.include, l = a.length; i < l; i++) {
              if (a[i] == null || a[i].$$type !== "Mixin") {
                throw new Error(
                  'The include definition in class "' +
                    name +
                    '" contains an invalid mixin at position ' +
                    i +
                    ": " +
                    a[i]
                );
              }
            }
          } else {
            throw new Error(
              'Invalid include definition in class "' +
                name +
                '"! Only mixins and arrays of mixins are allowed!'
            );
          }
        }

        // Validate implement definition
        if (config.implement) {
          if (qx.Bootstrap.getClass(config.implement) === "Array") {
            for (var i = 0, a = config.implement, l = a.length; i < l; i++) {
              if (a[i] == null || a[i].$$type !== "Interface") {
                throw new Error(
                  'The implement definition in class "' +
                    name +
                    '" contains an invalid interface at position ' +
                    i +
                    ": " +
                    a[i]
                );
              }
            }
          } else {
            throw new Error(
              'Invalid implement definition in class "' +
                name +
                '"! Only interfaces and arrays of interfaces are allowed!'
            );
          }
        }

        // Check mixin compatibility
        if (config.include) {
          try {
            qx.Mixin.checkCompatibility(config.include);
          } catch (ex) {
            throw new Error(
              'Error in include definition of class "' +
                name +
                '"! ' +
                ex.message
            );
          }
        }

        // Validate environment
        if (config.environment) {
          for (var key in config.environment) {
            if (
              key.substr(0, key.indexOf(".")) !=
              name.substr(0, name.indexOf("."))
            ) {
              throw new Error(
                'Forbidden environment setting "' +
                  key +
                  '" found in "' +
                  name +
                  '". It is forbidden to define a ' +
                  "environment setting for an external namespace!"
              );
            }
          }
        }

        // Validate settings
        if (config.settings) {
          for (var key in config.settings) {
            if (
              key.substr(0, key.indexOf(".")) !=
              name.substr(0, name.indexOf("."))
            ) {
              throw new Error(
                'Forbidden setting "' +
                  key +
                  '" found in "' +
                  name +
                  '". It is forbidden to define a default setting for an external namespace!'
              );
            }
          }
        }

        // Validate variants
        if (config.variants) {
          for (var key in config.variants) {
            if (
              key.substr(0, key.indexOf(".")) !=
              name.substr(0, name.indexOf("."))
            ) {
              throw new Error(
                'Forbidden variant "' +
                  key +
                  '" found in "' +
                  name +
                  '". It is forbidden to define a variant for an external namespace!'
              );
            }
          }
        }
      },

      default(name, config) {}
    }),

    /**
     * Validates the interfaces required by abstract base classes
     *
     * @signature function(clazz)
     * @param clazz {Class} The configured class.
     */
    __validateAbstractInterfaces: qx.core.Environment.select("qx.debug", {
      true(clazz) {
        var superclass = clazz.superclass;
        while (superclass) {
          if (superclass.$$classtype !== "abstract") {
            break;
          }

          var interfaces = superclass.$$implements;
          if (interfaces) {
            for (var i = 0; i < interfaces.length; i++) {
              qx.Interface.assert(clazz, interfaces[i], true);
            }
          }
          superclass = superclass.superclass;
        }
      },

      default(clazz) {}
    }),

    /**
     * Attaches an annotation to a class
     *
     * @param clazz {Map} Static methods or fields
     * @param group {String} Group name
     * @param key {String} Name of the annotated item
     * @param anno {Object} Annotation object
     */
    __attachAnno(clazz, group, key, anno) {
      if (anno !== undefined) {
        if (clazz.$$annotations === undefined) {
          clazz.$$annotations = {};
          clazz.$$annotations[group] = {};
        } else if (clazz.$$annotations[group] === undefined) {
          clazz.$$annotations[group] = {};
        }

        if (!qx.lang.Type.isArray(anno)) {
          anno = [anno];
        }

        if (key) {
          clazz.$$annotations[group][key] = anno;
        } else {
          clazz.$$annotations[group] = anno;
        }
      }
    },

    /**
     * Creates a class by type. Supports modern inheritance etc.
     *
     * @param name {String} Full name of the class
     * @param type {String} type of the class, i.e. "static", "abstract" or "singleton"
     * @param extend {Class} Superclass to inherit from
     * @param statics {Map} Static methods or fields
     * @param construct {Function} Constructor of the class
     * @param destruct {Function} Destructor of the class
     * @param mixins {Mixin[]} array of mixins of the class
     * @return {Class} The generated class
     */
    __createClass(name, type, extend, statics, construct, destruct, mixins) {
      var isStrictMode = function () {
        return typeof this == "undefined";
      };

      var clazz;

      if (!extend && qx.core.Environment.get("qx.aspects") == false) {
        // Create empty/non-empty class
        clazz = statics || {};
        qx.Bootstrap.setDisplayNames(clazz, name);
      } else {
        clazz = {};

        if (extend) {
          // Create default constructor
          if (!construct) {
            construct = this.__createDefaultConstructor();
          }

          clazz = this.__wrapConstructor(construct, name, type);

          // Add singleton getInstance()
          if (type === "singleton") {
            clazz.getInstance = this.getInstance;
          }

          qx.Bootstrap.setDisplayName(construct, name, "constructor");
        }

        // Copy statics
        if (statics) {
          qx.Bootstrap.setDisplayNames(statics, name);

          var key;

          for (var i = 0, a = Object.keys(statics), l = a.length; i < l; i++) {
            key = a[i];
            var staticValue = statics[key];

            if (qx.core.Environment.get("qx.debug")) {
              if (key.charAt(0) === "@") {
                if (statics[key.substring(1)] === undefined) {
                  throw new Error(
                    'Annonation for static "' +
                      key.substring(1) +
                      '" of Class "' +
                      clazz.classname +
                      '" does not exist!'
                  );
                }
                if (key.charAt(1) === "_" && key.charAt(2) === "_") {
                  throw new Error(
                    'Cannot annotate private static "' +
                      key.substring(1) +
                      '" of Class "' +
                      clazz.classname
                  );
                }
              }
            }
            if (key.charAt(0) === "@") {
              continue;
            }

            if (qx.core.Environment.get("qx.aspects")) {
              if (staticValue instanceof Function) {
                staticValue = qx.core.Aspect.wrap(
                  name + "." + key,
                  staticValue,
                  "static"
                );
              }

              clazz[key] = staticValue;
            } else {
              clazz[key] = staticValue;
            }

            // Attach annotations
            this.__attachAnno(clazz, "statics", key, statics["@" + key]);
          }
        }
      }

      // Create namespace
      var basename = name ? qx.Bootstrap.createNamespace(name, clazz) : "";

      // Store names in constructor/object
      clazz.classname = name;
      if (!isStrictMode()) {
        try {
          clazz.name = name;
        } catch (ex) {
          // Nothing
        }
      }
      clazz.basename = basename;

      // Store type info
      clazz.$$type = "Class";
      if (type) {
        clazz.$$classtype = type;
      }

      // Attach toString
      if (!clazz.hasOwnProperty("toString")) {
        clazz.toString = this.genericToString;
      }

      if (extend) {
        qx.Bootstrap.extendClass(clazz, construct, extend, name, basename);

        // Store destruct onto class
        if (destruct) {
          if (qx.core.Environment.get("qx.aspects")) {
            destruct = qx.core.Aspect.wrap(name, destruct, "destructor");
          }

          clazz.$$destructor = destruct;
          qx.Bootstrap.setDisplayName(destruct, name, "destruct");
        }
      }

      // Store class reference in global class registry
      this.$$registry[name] = clazz;

      // Return final class object
      return clazz;
    },

    /*
    ---------------------------------------------------------------------------
       PRIVATE ADD HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Attach events to the class
     *
     * @param clazz {Class} class to add the events to
     * @param events {Map} map of event names the class fires.
     * @param patch {Boolean ? false} Enable redefinition of event type?
     */
    __addEvents(clazz, events, patch) {
      if (qx.core.Environment.get("qx.debug")) {
        if (
          typeof events !== "object" ||
          qx.Bootstrap.getClass(events) === "Array"
        ) {
          throw new Error(
            clazz.classname + ": the events must be defined as map!"
          );
        }

        for (var key in events) {
          if (typeof events[key] !== "string") {
            throw new Error(
              clazz.classname +
                "/" +
                key +
                ": the event value needs to be a string with the class name of the event object which will be fired."
            );
          }
        }

        // Compare old and new event type/value if patching is disabled
        if (clazz.$$events && patch !== true) {
          for (var key in events) {
            if (
              clazz.$$events[key] !== undefined &&
              clazz.$$events[key] !== events[key]
            ) {
              throw new Error(
                clazz.classname +
                  "/" +
                  key +
                  ": the event value/type cannot be changed from " +
                  clazz.$$events[key] +
                  " to " +
                  events[key]
              );
            }
          }
        }
      }

      if (clazz.$$events) {
        for (var key in events) {
          clazz.$$events[key] = events[key];
        }
      } else {
        clazz.$$events = events;
      }
    },

    /**
     * Attach properties to classes
     *
     * @param clazz {Class} class to add the properties to
     * @param properties {Map} map of properties
     * @param patch {Boolean ? false} Overwrite property with the limitations of a property
               which means you are able to refine but not to replace (esp. for new properties)
     */
    __addProperties(clazz, properties, patch) {
      // check for the property module
      if (!qx.core.Environment.get("module.property")) {
        throw new Error("Property module disabled.");
      }

      if (qx.core.Environment.get("qx.debug")) {
        if (qx.Bootstrap.isQxCoreObject(properties)) {
          throw new Error("Invalid 'properties' for " + clazz.classname);
        }
      }

      var config;

      if (patch === undefined) {
        patch = false;
      }

      var proto = clazz.prototype;

      for (var name in properties) {
        config = properties[name];

        // Check incoming configuration
        if (qx.core.Environment.get("qx.debug")) {
          this.__validateProperty(clazz, name, config, patch);
        }

        // Store name into configuration
        config.name = name;

        // Add config to local registry
        if (!config.refine) {
          if (clazz.$$properties === undefined) {
            clazz.$$properties = {};
          }

          clazz.$$properties[name] = config;
        }

        // Store init value to prototype. This makes it possible to
        // overwrite this value in derived classes.
        if (config.init !== undefined) {
          clazz.prototype["$$init_" + name] = config.init;
        }

        // register event name
        if (config.event !== undefined) {
          // break if no events layer loaded
          if (!qx.core.Environment.get("module.events")) {
            throw new Error("Events module not enabled.");
          }
          var event = {};
          event[config.event] = "qx.event.type.Data";
          if (config.async) {
            event[config.event + "Async"] = "qx.event.type.Data";
          }
          this.__addEvents(clazz, event, patch);
        }

        // Remember inheritable properties
        if (config.inheritable) {
          this.__Property.$$inheritable[name] = true;
          if (!proto.$$refreshInheritables) {
            this.__Property.attachRefreshInheritables(clazz);
          }
        }

        if (!config.refine) {
          this.__Property.attachMethods(clazz, name, config);
        }

        // Add annotations
        this.__attachAnno(clazz, "properties", name, config["@"]);
      }
    },

    /**
     * Validates the given property
     *
     * @signature function(clazz, name, config, patch)
     * @param clazz {Class} class to add property to
     * @param name {String} name of the property
     * @param config {Map} configuration map
     * @param patch {Boolean ? false} enable refine/patch?
     */
    __validateProperty: qx.core.Environment.select("qx.debug", {
      true(clazz, name, config, patch) {
        // check for properties
        if (!qx.core.Environment.get("module.property")) {
          throw new Error("Property module disabled.");
        }

        var has = this.hasProperty(clazz, name);

        if (has) {
          var existingProperty = this.getPropertyDefinition(clazz, name);

          if (
            config.refine &&
            existingProperty.init === undefined &&
            existingProperty["@"] === undefined
          ) {
            this.warn(
              "Refine a property when there is previously no init or annotations defined. Property '" +
                name +
                "' of class '" +
                clazz.classname +
                "'."
            );
          }
        }

        if (!has && config.refine) {
          throw new Error(
            "Could not refine non-existent property: '" +
              name +
              "' of class: '" +
              clazz.classname +
              "'!"
          );
        }

        if (has && !patch) {
          throw new Error(
            "Class " +
              clazz.classname +
              " already has a property: " +
              name +
              "!"
          );
        }

        if (has && patch) {
          if (!config.refine) {
            throw new Error(
              'Could not refine property "' +
                name +
                '" without a "refine" flag in the property definition! This class: ' +
                clazz.classname +
                ", original class: " +
                this.getByProperty(clazz, name).classname +
                "."
            );
          }

          for (var key in config) {
            if (key !== "init" && key !== "refine" && key !== "@") {
              throw new Error(
                "Class " +
                  clazz.classname +
                  " could not refine property: " +
                  name +
                  "! Key: " +
                  key +
                  " could not be refined!"
              );
            }
          }
        }

        // Check 0.7 keys
        var allowed = config.group
          ? this.__Property.$$allowedGroupKeys
          : this.__Property.$$allowedKeys;
        for (var key in config) {
          if (allowed[key] === undefined) {
            throw new Error(
              'The configuration key "' +
                key +
                '" of property "' +
                name +
                '" in class "' +
                clazz.classname +
                '" is not allowed!'
            );
          }

          if (config[key] === undefined) {
            throw new Error(
              'Invalid key "' +
                key +
                '" of property "' +
                name +
                '" in class "' +
                clazz.classname +
                '"! The value is undefined: ' +
                config[key]
            );
          }

          if (allowed[key] !== null && typeof config[key] !== allowed[key]) {
            throw new Error(
              'Invalid type of key "' +
                key +
                '" of property "' +
                name +
                '" in class "' +
                clazz.classname +
                '"! The type of the key must be "' +
                allowed[key] +
                '"!'
            );
          }
        }

        if (config.transform != null) {
          if (!(typeof config.transform === "string")) {
            throw new Error(
              'Invalid transform definition of property "' +
                name +
                '" in class "' +
                clazz.classname +
                '"! Needs to be a String.'
            );
          }
        }

        if (config.check != null) {
          if (
            !qx.Bootstrap.isString(config.check) &&
            !qx.Bootstrap.isArray(config.check) &&
            !qx.Bootstrap.isFunction(config.check)
          ) {
            throw new Error(
              'Invalid check definition of property "' +
                name +
                '" in class "' +
                clazz.classname +
                '"! Needs to be a String, Array or Function.'
            );
          }
        }
      },

      default: null
    }),

    /**
     * Attach members to a class
     *
     * @param clazz {Class} clazz to add members to
     * @param members {Map} The map of members to attach
     * @param patch {Boolean ? false} Enable patching of
     * @param base {Boolean ? true} Attach base flag to mark function as members
     *     of this class
     * @param wrap {Boolean ? false} Whether the member method should be wrapped.
     *     this is needed to allow base calls in patched mixin members.
     */
    __addMembers(clazz, members, patch, base, wrap) {
      var proto = clazz.prototype;
      var key, member;
      qx.Bootstrap.setDisplayNames(members, clazz.classname + ".prototype");

      for (var i = 0, a = Object.keys(members), l = a.length; i < l; i++) {
        key = a[i];
        member = members[key];

        if (qx.core.Environment.get("qx.debug")) {
          if (key.charAt(0) === "@") {
            var annoKey = key.substring(1);
            if (
              members[annoKey] === undefined &&
              proto[annoKey] === undefined
            ) {
              throw new Error(
                'Annonation for "' +
                  annoKey +
                  '" of Class "' +
                  clazz.classname +
                  '" does not exist!'
              );
            }
            if (key.charAt(1) === "_" && key.charAt(2) === "_") {
              throw new Error(
                'Cannot annotate private member "' +
                  key.substring(1) +
                  '" of Class "' +
                  clazz.classname
              );
            }
          } else {
            if (
              proto[key] !== undefined &&
              key.charAt(0) === "_" &&
              key.charAt(1) === "_"
            ) {
              throw new Error(
                'Overwriting private member "' +
                  key +
                  '" of Class "' +
                  clazz.classname +
                  '" is not allowed!'
              );
            }

            if (patch !== true && proto.hasOwnProperty(key)) {
              throw new Error(
                'Overwriting member "' +
                  key +
                  '" of Class "' +
                  clazz.classname +
                  '" is not allowed!'
              );
            }
          }
        }

        // Annotations are not members
        if (key.charAt(0) === "@") {
          var annoKey = key.substring(1);
          if (members[annoKey] === undefined) {
            this.__attachAnno(clazz, "members", annoKey, members[key]);
          }
          continue;
        }

        // If it's a property accessor, we need to install it now so that this.base can refer to it
        if (proto[key] != undefined && proto[key].$$install) {
          proto[key].$$install();
        }

        // Added helper stuff to functions
        // Hint: Could not use typeof function because RegExp objects are functions, too
        // Protect to apply base property and aspect support on special attributes e.g.
        // classes which are function like as well.
        if (
          base !== false &&
          member instanceof Function &&
          member.$$type == null
        ) {
          // If the class has it's own implementation, we need to remember that method in the
          //  mixed-in method's `.base`; wrap the method with a closure so that it can have a
          //  `.base` set, if we were to set `member.base` it would mean that the mixin can
          //  only be added into one class
          if (wrap) {
            if (proto[key]) {
              member = qx.lang.Function.create(member, { always: true });
            }
            member.self = clazz;
          }
          member.base = proto[key];

          if (qx.core.Environment.get("qx.aspects")) {
            member = qx.core.Aspect.wrap(
              clazz.classname + "." + key,
              member,
              "member"
            );
          }
        }

        // Attach member
        proto[key] = member;

        // Attach annotations
        this.__attachAnno(clazz, "members", key, members["@" + key]);
      }
    },

    /**
     * Add a single interface to a class
     *
     * @param clazz {Class} class to add interface to
     * @param iface {Interface} the Interface to add
     */
    __addInterface(clazz, iface) {
      if (qx.core.Environment.get("qx.debug")) {
        if (!clazz || !iface) {
          throw new Error("Incomplete parameters!");
        }

        // This differs from mixins, we only check if the interface is already
        // directly used by this class. It is allowed however, to have an interface
        // included multiple times by extends in the interfaces etc.
        if (this.hasOwnInterface(clazz, iface)) {
          throw new Error(
            'Interface "' +
              iface.name +
              '" is already used by Class "' +
              clazz.classname +
              "!"
          );
        }

        // Check interface and wrap members
        if (clazz.$$classtype !== "abstract") {
          qx.Interface.assert(clazz, iface, true);
        }
      }

      // Store interface reference
      var list = qx.Interface.flatten([iface]);
      if (clazz.$$implements) {
        clazz.$$implements.push(iface);
        clazz.$$flatImplements.push.apply(clazz.$$flatImplements, list);
      } else {
        clazz.$$implements = [iface];
        clazz.$$flatImplements = list;
      }
    },

    /**
     * Include all features of the mixin into the given class, recursively.
     *
     * @param clazz {Class} The class onto which the mixin should be attached.
     * @param mixin {Mixin} Include all features of this mixin
     * @param patch {Boolean} Overwrite existing fields, functions and properties
     */
    __addMixin(clazz, mixin, patch) {
      if (qx.core.Environment.get("qx.debug")) {
        if (!clazz || !mixin) {
          throw new Error("Incomplete parameters!");
        }
      }

      if (this.hasMixin(clazz, mixin)) {
        return;
      }

      // Attach content
      var list = qx.Mixin.flatten([mixin]);
      var entry;

      for (var i = 0, l = list.length; i < l; i++) {
        entry = list[i];

        // Attach events
        if (entry.$$events) {
          this.__addEvents(clazz, entry.$$events, patch);
        }

        // Attach properties (Properties are already readonly themselves, no patch handling needed)
        if (entry.$$properties) {
          this.__addProperties(clazz, entry.$$properties, patch);
        }

        // Attach members (Respect patch setting, but dont apply base variables)
        if (entry.$$members) {
          this.__addMembers(clazz, entry.$$members, patch, patch, patch);
        }
      }

      // Store mixin reference
      if (clazz.$$includes) {
        clazz.$$includes.push(mixin);
        clazz.$$flatIncludes.push.apply(clazz.$$flatIncludes, list);
      } else {
        clazz.$$includes = [mixin];
        clazz.$$flatIncludes = list;
      }
    },

    /*
    ---------------------------------------------------------------------------
       PRIVATE FUNCTION HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the default constructor.
     * This constructor just calls the constructor of the base class.
     *
     * @return {Function} The default constructor.
     */
    __createDefaultConstructor() {
      function defaultConstructor() {
        defaultConstructor.base.apply(this, arguments);
      }

      return defaultConstructor;
    },

    /**
     * Generate a wrapper of the original class constructor in order to enable
     * some of the advanced OO features (e.g. abstract class, singleton, mixins)
     *
     * @param construct {Function} the original constructor
     * @param name {String} name of the class
     * @param type {String} the user specified class type
     * @return {Function} The wrapped constructor
     */
    __wrapConstructor(construct, name, type) {
      var wrapper = function () {
        var clazz = wrapper;

        if (qx.core.Environment.get("qx.debug")) {
          // new keyword check
          if (!(this instanceof clazz)) {
            throw new Error(
              "Please initialize '" + name + "' objects using the new keyword!"
            );
          }

          // add abstract and singleton checks
          if (type === "abstract") {
            if (this.classname === name) {
              throw new Error(
                "The class '," +
                  name +
                  "' is abstract! It is not possible to instantiate it."
              );
            }
          } else if (type === "singleton") {
            if (!clazz.$$allowconstruct) {
              throw new Error(
                "The class '" +
                  name +
                  "' is a singleton! It is not possible to instantiate it directly. Use the static getInstance() method instead."
              );
            }
          }
        }

        // Execute default constructor
        var retval = clazz.$$original.apply(this, arguments);

        // Initialize local mixins
        if (clazz.$$includes) {
          var mixins = clazz.$$flatIncludes;
          for (var i = 0, l = mixins.length; i < l; i++) {
            if (mixins[i].$$constructor) {
              mixins[i].$$constructor.apply(this, arguments);
            }
          }
        }

        if (qx.core.Environment.get("qx.debug")) {
          // Mark instance as initialized
          if (this.classname === name) {
            this.$$initialized = true;
          }
        }

        // Return optional return value
        return retval;
      };

      if (qx.core.Environment.get("qx.aspects")) {
        var aspectWrapper = qx.core.Aspect.wrap(name, wrapper, "constructor");
        wrapper.$$original = construct;
        wrapper.constructor = aspectWrapper;
        wrapper = aspectWrapper;
      }

      // Store original constructor
      wrapper.$$original = construct;

      // Store wrapper into constructor (needed for base calls etc.)
      construct.wrapper = wrapper;

      // Return generated wrapper
      return wrapper;
    }
  },

  defer() {
    // Binding of already loaded bootstrap classes
    if (qx.core.Environment.get("qx.aspects")) {
      for (var classname in qx.Bootstrap.$$registry) {
        var statics = qx.Bootstrap.$$registry[classname];

        for (var key in statics) {
          // only functions, no regexps
          if (statics[key] instanceof Function) {
            statics[key] = qx.core.Aspect.wrap(
              classname + "." + key,
              statics[key],
              "static"
            );
          }
        }
      }
    }
  }
});
